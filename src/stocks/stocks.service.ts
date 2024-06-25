import { Injectable } from '@nestjs/common';
import { Card, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { StockInputType, StockOutputType } from './class';
import {
  CreateStockConstrainedOutputDto,
  CreateStockManualInputDto,
  CreateStockManualOutputDto,
  CreateStockNormalOutputDto,
  CreateStockRetrocessionDto,
  UpdateStockManualInputDto,
  UpdateStockManualOutputDto,
  CheckCardProductsAvailabilityDto,
} from './dto';
import { StockEntity, StockCountEntity } from './entities';
import { transformWhereInput } from 'src/common/transformer/transformer.service';
import { SocketGateway } from 'src/common/socket/socket.gateway';

@Injectable()
export class StocksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly socketGateway: SocketGateway,
  ) {}

  async checkProductsStocksAvailability({
    productsIds,
    productsOutputQuantities,
  }: {
    productsIds: number[];
    productsOutputQuantities: number[];
  }): Promise<boolean> {
    // check if every product passed are availaible in stock and
    // it stock quantity is equal or greather than the required
    // the required for making an output

    let availabilities: boolean[] = [];

    for (let i = 0; i < productsIds.length; i++) {
      // get the last product stock
      const productStocks = await this.prisma.stock.findMany({
        where: { productId: productsIds[i] },
        orderBy: {
          id: 'desc',
        },
        take: 1,
      });

      const lastProductStock =
        productStocks.length > 0 ? productStocks[0] : null;

      // if the product stock not exist
      if (!lastProductStock) {
        // mark as not available
        availabilities[i] = false;
        // continue with the next productId
        continue;
      } else {
        // the product is available in stock

        // check if it stock quantity is sufficient for the output
        if (lastProductStock.stockQuantity - productsOutputQuantities[i] > 0) {
          availabilities[i] = true;
        } else {
          availabilities[i] = false;
        }
      }
    }

    return availabilities.every((availability) => availability);
  }

  async outputProducts({
    card,
    productsIds,
    productsOutputQuantities,
    outputType,
    agentId,
    satisfiedAt,
  }: {
    // the card to satisfied by normal or constrained outpu
    card: Card;
    // products Ids
    productsIds: number[];
    // products numbers (in type for normal output, or custom numbers for constrained output)
    productsOutputQuantities: number[];
    // output type, either normal or constrained
    outputType: string;
    // agent Id (necessary for creating new stocks)
    agentId: number;
    // satisfaction date
    satisfiedAt: string;
  }): Promise<StockEntity[]> {
    // TODO
    // fix errors

    let newStocks: StockEntity[] = [];
    for (let i = 0; i < productsIds.length; i++) {
      // get the last product stock
      const productStocks = await this.prisma.stock.findMany({
        where: { productId: productsIds[i] },
        orderBy: {
          id: 'desc',
        },
        take: 1,
      });

      // console.log({ productStocks: productStocks });

      const lastProductStock = productStocks[0];

      // create output stock
      newStocks[i] = await this.prisma.stock.create({
        data: {
          productId: productsIds[i],
          cardId: card.id,
          initialQuantity: lastProductStock.stockQuantity,
          outputQuantity: productsOutputQuantities[i],
          stockQuantity:
            lastProductStock.stockQuantity - productsOutputQuantities[i],
          movementType: outputType,
          agentId: agentId,
          createdAt: new Date(satisfiedAt),
        },
        include: {
          product: true,
          card: {
            include: {
              type: true,
              customer: {
                include: {
                  collector: true,
                },
              },
            },
          },
          agent: true,
        },
      });

      // emit addition event
      this.socketGateway.emitProductEvent({
        event: 'stock-addition',
        data: newStocks[i],
      });
    }

    // mark the card as satisfied
    const updatedCard = await this.prisma.card.update({
      where: {
        id: card.id,
      },
      data: {
        satisfiedAt: new Date(satisfiedAt),
        updatedAt: new Date().toISOString(),
      },
    });

    // emit update event
    this.socketGateway.emitProductEvent({
      event: 'card-update',
      data: updatedCard,
    });

    return newStocks;
  }

  async retrocedeProducts({
    cardId,
    agentId,
  }: {
    // the card to satisfied by normal or constrained outpu
    cardId: number;

    // agent Id (necessary for creating new input)
    agentId: number;
  }): Promise<StockEntity[]> {
    let newStocks: StockEntity[] = [];

    // get the corresponding card
    let card = await this.prisma.card.findUnique({
      where: {
        id: cardId,
      },
      include: {
        type: {
          include: {
            typeProducts: true,
          },
        },
      },
    });

    // get the last output done for the card
    // so as to know if it is a normal ou constrained output
    const cardStockOutputs = await this.prisma.stock.findMany({
      where: {
        cardId: card.id,
        outputQuantity: {
          not: null,
        },
      },
      orderBy: {
        id: 'desc',
      },
    });

    // get the last
    const lastCardStockOutput =
      cardStockOutputs.length > 0 ? cardStockOutputs[0] : null;

    // check if it is a normal or constrained output
    if (lastCardStockOutput.movementType === StockOutputType.normal) {
      // make simple retrocession based on card types products

      for (let i = 0; i < card.type.typeProducts.length; i++) {
        const productId = card.type.typeProducts[i].productId;

        // get the last stock of the product
        const productLastStocks = await this.prisma.stock.findMany({
          where: {
            productId: productId,
          },
          orderBy: {
            id: 'desc',
          },
        });

        const productLastStock =
          productLastStocks.length > 0 ? productLastStocks[0] : null;

        // throw error if last stock is not found
        if (!productLastStock) {
          throw Error('Corrupted data');
        }

        // make the retrocession
        newStocks[i] = await this.prisma.stock.create({
          data: {
            productId: productLastStock.productId,
            cardId: cardId,
            initialQuantity: productLastStock.stockQuantity,
            // input quantity is the number of product defined for the card
            inputQuantity:
              card.typesNumber * card.type.typeProducts[i].productNumber,
            stockQuantity:
              productLastStock.stockQuantity +
              card.typesNumber * card.type.typeProducts[i].productNumber,
            movementType: StockInputType.retrocession,
            agentId: agentId,
          },
          include: {
            product: true,
            card: {
              include: {
                type: true /*{
                  include: {
                    typeProducts: {
                      include: {
                        product: true,
                      },
                    },
                  },
                },*/,
                customer: true,
              },
            },
            agent: true,
          },
        });

        // emit addition event
        this.socketGateway.emitProductEvent({
          event: 'stock-addition',
          data: newStocks[i],
        });
      }
    } else {
      // it is a constrained output

      // check if the output where done at this hours
      // if true, throw an error
      // that for avoiding data trouble
      // it for facilitate outputed products in case of constrained
      // output, in case of constrained output, any product can be outputed
      // for satisfying the card, it will be very difficult to identify
      // the products outputed for satisfying the card if multiple retrocession
      // are made the same hour
      // For exemple, it will be difficult to make a retrocession in mutiple constrained satisfaction trying, discarding

      // check if one retrocession have done from the card in the current hour

      // get the last retrocession done for the card
      // so as to know if it have done in this hour
      const cardStockRetrocessions = await this.prisma.stock.findMany({
        where: {
          cardId: card.id,
          movementType: StockInputType.retrocession,
        },
        orderBy: {
          id: 'desc',
        },
      });

      const lastCardStockRetrocession =
        cardStockRetrocessions.length > 0 ? cardStockRetrocessions[0] : null;

      if (
        lastCardStockRetrocession &&
        lastCardStockRetrocession.createdAt.getFullYear() ===
          new Date().getFullYear() &&
        lastCardStockRetrocession.createdAt.getMonth() ===
          new Date().getMonth() &&
        lastCardStockRetrocession.createdAt.getDate() ===
          new Date().getDate() &&
        lastCardStockRetrocession.createdAt.getHours() === new Date().getHours()
      ) {
        throw Error('Multiple retrocession per hour impossible');
      } else {
        // last retrocession done is not at this hours

        // fetch all products outputed for the card at the hour of satisfaction date
        const productsOutputedStock = await this.prisma.stock.findMany({
          where: {
            cardId: card.id,
            outputQuantity: {
              not: null,
            },

            movementType: StockOutputType.constraint,
            createdAt: {
              gte: new Date(
                card.satisfiedAt.getFullYear(),
                card.satisfiedAt.getMonth(),
                card.satisfiedAt.getDate(),
                card.satisfiedAt.getHours(),
                0,
                0,
              ),
              lt: new Date(
                card.satisfiedAt.getFullYear(),
                card.satisfiedAt.getMonth(),
                card.satisfiedAt.getDate(),
                card.satisfiedAt.getHours() + 1,
                0,
                0,
              ),
            },
          },
        });

        // check if products stocks exist
        // if not throw error
        // error because if the card where satisfied
        // stock outputs must be found
        if (productsOutputedStock.length < 0) {
          throw Error('Corrupted data');
        } else {
          // product exists

          // for each product stock, make a retrocession,

          /// *** TESTING *** ///

          for (let i = 0; i < productsOutputedStock.length; i++) {
            const productOutputedStock = productsOutputedStock[i];

            // get the last stock of the product
            // this because, the outputed stock for that product may not be
            // the last stock movemement of the product
            // May be, an input have be done after the output

            const productLastStocks = await this.prisma.stock.findMany({
              where: {
                productId: productOutputedStock.productId,
              },
              orderBy: {
                id: 'desc',
              },
            });

            const productLastStock = productLastStocks[0];

            // make the retrocesion
            newStocks[i] = await this.prisma.stock.create({
              data: {
                productId: productLastStock.productId,
                cardId: cardId,
                initialQuantity: productLastStock.stockQuantity,
                inputQuantity: productOutputedStock.outputQuantity,
                stockQuantity:
                  productLastStock.stockQuantity +
                  productOutputedStock.outputQuantity,
                movementType: StockInputType.retrocession,
                agentId: agentId,
              },
              include: {
                product: true,
                card: {
                  include: {
                    type: true,
                    customer: {
                      include: {
                        collector: true,
                      },
                    },
                  },
                },
                agent: true,
              },
            });

            // emit addition event
            this.socketGateway.emitProductEvent({
              event: 'stock-addition',
              data: newStocks[i],
            });
          }
        }
      }
    }

    // pass satisfied at date to null
    const updatedCard = await this.prisma.card.update({
      where: {
        id: card.id,
      },
      data: {
        satisfiedAt: null,
        updatedAt: new Date().toISOString(),
      },
    });

    // emit update event
    this.socketGateway.emitProductEvent({
      event: 'card-update',
      data: updatedCard,
    });

    return newStocks;
  }

  /// ******* MAIN FUNCTIONS ******* ///

  async checkCardsProductsAvailibility({
    checkCardProductsAvailabilityDto,
  }: {
    checkCardProductsAvailabilityDto: CheckCardProductsAvailabilityDto;
  }): Promise<StockCountEntity> {
    // check if the provided card ID exist
    const card = await this.prisma.card.findUnique({
      where: { id: checkCardProductsAvailabilityDto.cardId },
      include: {
        type: {
          include: {
            typeProducts: true,
          },
        },
      },
    });

    // throw an error if not
    if (!card) {
      throw Error(`Card not found`);
    }

    const productsIds = card.type.typeProducts.map(
      (typeProduct) => typeProduct.productId,
    );

    const productsNumbers = card.type.typeProducts.map(
      (typeProduct) => card.typesNumber * typeProduct.productNumber,
    );

    const areProductsAvailable = await this.checkProductsStocksAvailability({
      productsIds: productsIds,
      productsOutputQuantities: productsNumbers,
    });

    return { count: areProductsAvailable ? 1 : 0 };
  }

  async createStockManualInput({
    createStockManualInputDto,
  }: {
    createStockManualInputDto: CreateStockManualInputDto;
  }): Promise<StockEntity> {
    try {
      // check if the provided agent ID exist
      const agent = await this.prisma.agent.findUnique({
        where: { id: createStockManualInputDto.agentId },
      });

      // throw an error if not
      if (!agent) {
        throw Error(`Agent not found`);
      }

      // check if the provided product ID exist
      const product = await this.prisma.product.findUnique({
        where: { id: createStockManualInputDto.productId },
        include: {
          stocks: true,
        },
      });

      // throw an error if not
      if (!product) {
        throw Error(`Product not found`);
      }

      // try to get last product stock
      product.stocks.sort((stock1, stock2) => stock2.id - stock1.id);

      const lastProductStock =
        product.stocks.length > 0 ? product.stocks[0] : null;

      let newStock;

      // if the product is not in stock
      if (!lastProductStock) {
        // add the first stock
        newStock = {
          ...createStockManualInputDto,
          initialQuantity: 0,
          stockQuantity: createStockManualInputDto.inputQuantity,
          movementType: StockInputType.manual,
        };
      } else {
        // complete the stock
        newStock = {
          ...createStockManualInputDto,
          initialQuantity: lastProductStock.stockQuantity,
          stockQuantity:
            lastProductStock.stockQuantity +
            createStockManualInputDto.inputQuantity,
          movementType: StockInputType.manual,
        };
      }

      // create a new stock
      const stock = await this.prisma.stock.create({
        data: newStock,
      });

      // emit addition event
      this.socketGateway.emitProductEvent({
        event: 'stock-addition',
        data: stock,
      });

      return this.findOne({ id: stock.id });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        throw new Error('Invalid query or request');
      }
      if (error instanceof Prisma.PrismaClientRustPanicError) {
        throw new Error('Internal Prisma client error');
      }
      if (error instanceof Prisma.PrismaClientInitializationError) {
        throw new Error('Prisma client initialization error');
      }
      throw error;
    }
  }

  async createStockRetrocession({
    createStockRetrocessionDto,
  }: {
    createStockRetrocessionDto: CreateStockRetrocessionDto;
  }): Promise<StockEntity[]> {
    try {
      // check if the provided agent ID exist
      const agent = await this.prisma.agent.findUnique({
        where: { id: createStockRetrocessionDto.agentId },
      });

      // throw an error if not
      if (!agent) {
        throw Error(`Agent not found`);
      }

      // check if the provided card ID exist
      const card = await this.prisma.card.findUnique({
        where: { id: createStockRetrocessionDto.cardId },
      });

      // throw an error if not
      if (!card) {
        throw Error(`Card not found`);
      }

      // throw error if the card is not satisfied
      if (!card.satisfiedAt) {
        throw Error(`Card is not satisfied`);
      }

      // make retrocession
      return await this.retrocedeProducts({
        cardId: card.id,
        agentId: agent.id,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        throw new Error('Invalid query or request');
      }
      if (error instanceof Prisma.PrismaClientRustPanicError) {
        throw new Error('Internal Prisma client error');
      }
      if (error instanceof Prisma.PrismaClientInitializationError) {
        throw new Error('Prisma client initialization error');
      }
      throw error;
    }
  }

  async createStockManualOutput({
    createStockManualOutputDto,
  }: {
    createStockManualOutputDto: CreateStockManualOutputDto;
  }): Promise<StockEntity> {
    try {
      // check if the provided agent ID exist
      const agent = await this.prisma.agent.findUnique({
        where: { id: createStockManualOutputDto.agentId },
      });

      // throw an error if not
      if (!agent) {
        throw Error(`Agent not found`);
      }

      // check if the provided product ID exist
      const product = await this.prisma.product.findUnique({
        where: { id: createStockManualOutputDto.productId },
        include: {
          stocks: true,
        },
      });

      // throw an error if not
      if (!product) {
        throw Error(`Product not found`);
      }

      // try to get last product stock
      product.stocks.sort((stock1, stock2) => stock2.id - stock1.id);

      const lastProductStock =
        product.stocks.length > 0 ? product.stocks[0] : null;

      // if the product is not in stock
      if (!lastProductStock) {
        throw Error('Product not in stock');
      }

      // check if the stock is sufficient for making an output
      if (
        lastProductStock.stockQuantity -
          createStockManualOutputDto.outputQuantity <
        0
      ) {
        throw Error('Insufficient stock quantity');
      }

      // create a new stock
      const stock = await this.prisma.stock.create({
        data: {
          ...createStockManualOutputDto,
          initialQuantity: lastProductStock.stockQuantity,
          stockQuantity:
            lastProductStock.stockQuantity -
            createStockManualOutputDto.outputQuantity,
          movementType: StockOutputType.manual,
        },
      });

      // emit addition event
      this.socketGateway.emitProductEvent({
        event: 'stock-addition',
        data: stock,
      });

      return this.findOne({ id: stock.id });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        throw new Error('Invalid query or request');
      }
      if (error instanceof Prisma.PrismaClientRustPanicError) {
        throw new Error('Internal Prisma client error');
      }
      if (error instanceof Prisma.PrismaClientInitializationError) {
        throw new Error('Prisma client initialization error');
      }
      throw error;
    }
  }

  async createStockNormalOutput({
    createStockNormalOutputDto,
  }: {
    createStockNormalOutputDto: CreateStockNormalOutputDto;
  }): Promise<StockEntity[]> {
    try {
      // check if the provided agent ID exist
      const agent = await this.prisma.agent.findUnique({
        where: { id: createStockNormalOutputDto.agentId },
      });

      // throw an error if not
      if (!agent) {
        throw Error(`Agent not found`);
      }

      // check if the provided card ID exist
      const card = await this.prisma.card.findUnique({
        where: { id: createStockNormalOutputDto.cardId },
        include: {
          type: {
            include: {
              typeProducts: true,
            },
          },
          settlements: true,
        },
      });

      // throw an error if not
      if (!card) {
        throw Error(`Card not found`);
      }

      // fetch all validated settlements of the card
      const cardValidatedSettlements = card.settlements.filter(
        (settlement) => settlement.isValidated,
      );

      // calculate the total of validated settlements
      const cardValidatedSettlementsTotal = cardValidatedSettlements.reduce(
        (total, settlement) => total + settlement.number,
        0,
      );

      if (cardValidatedSettlementsTotal != 372) {
        throw new Error('All settlements not done');
      }

      // check if all the product availability
      const isAllProductsAvailable = this.checkProductsStocksAvailability({
        productsIds: card.type.typeProducts.map(
          (productType) => productType.productId,
        ),
        productsOutputQuantities: card.type.typeProducts.map(
          (productType) => card.typesNumber * productType.productNumber,
        ),
      });

      // throw error, if one of products are not available in stock or it a
      // stock quantity is not sufficient
      if (!isAllProductsAvailable) {
        throw Error('Products not available');
      }

      // make outputs
      return await this.outputProducts({
        card: card,
        productsIds: card.type.typeProducts.map(
          (productType) => productType.productId,
        ),
        productsOutputQuantities: card.type.typeProducts.map(
          (productType) => card.typesNumber * productType.productNumber,
        ),
        outputType: StockOutputType.normal,
        agentId: createStockNormalOutputDto.agentId,
        satisfiedAt: createStockNormalOutputDto.satisfiedAt,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        throw new Error('Invalid query or request');
      }
      if (error instanceof Prisma.PrismaClientRustPanicError) {
        throw new Error('Internal Prisma client error');
      }
      if (error instanceof Prisma.PrismaClientInitializationError) {
        throw new Error('Prisma client initialization error');
      }
      throw error;
    }
  }

  async createStockConstrainedOutput({
    createStockConstrainedOutputDto,
  }: {
    createStockConstrainedOutputDto: CreateStockConstrainedOutputDto;
  }): Promise<StockEntity[]> {
    try {
      /*console.log({
        dto: createStockConstrainedOutputDto,
      });*/

      // check if the provided agent ID exist
      const agent = await this.prisma.agent.findUnique({
        where: { id: createStockConstrainedOutputDto.agentId },
      });

      // throw an error if not
      if (!agent) {
        throw Error(`Agent not found`);
      }

      // check if the provided card ID exist
      const card = await this.prisma.card.findUnique({
        where: { id: createStockConstrainedOutputDto.cardId },
        include: {
          type: true,
          settlements: true,
        },
      });

      // throw an error if not
      if (!card) {
        throw Error(`Card not found`);
      }

      // fetch all validated settlements of the card
      const cardValidatedSettlements = card.settlements.filter(
        (settlement) => settlement.isValidated,
      );

      // calculate the total of validated settlements
      const cardValidatedSettlementsTotal = cardValidatedSettlements.reduce(
        (total, settlement) => total + settlement.number,
        0,
      );

      if (cardValidatedSettlementsTotal != 372) {
        throw new Error('All settlements not done');
      }

      //  console.log('All settlements have been done');

      // check if prducts Ids and products outputed quantity
      // arrays have same size

      if (
        createStockConstrainedOutputDto.productsIds.length !=
        createStockConstrainedOutputDto.productsOutputQuantities.length
      ) {
        throw new Error(
          'Products array and output quantities array incompatibility',
        );
      }

      // check all the product availability
      const isAllProductsAvailable = await this.checkProductsStocksAvailability(
        {
          productsIds: createStockConstrainedOutputDto.productsIds,
          productsOutputQuantities:
            createStockConstrainedOutputDto.productsOutputQuantities,
        },
      );

      // throw error, if one of products are not available in stock
      // or it astock quantity is not sufficient
      if (!isAllProductsAvailable) {
        throw Error('Products not available');
      }

      //  console.log('All products are available');

      // make outputs
      return await this.outputProducts({
        card: card,
        productsIds: createStockConstrainedOutputDto.productsIds,
        productsOutputQuantities:
          createStockConstrainedOutputDto.productsOutputQuantities,
        outputType: StockOutputType.constraint,
        agentId: createStockConstrainedOutputDto.agentId,
        satisfiedAt: createStockConstrainedOutputDto.satisfiedAt,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        throw new Error('Invalid query or request');
      }
      if (error instanceof Prisma.PrismaClientRustPanicError) {
        throw new Error('Internal Prisma client error');
      }
      if (error instanceof Prisma.PrismaClientInitializationError) {
        throw new Error('Prisma client initialization error');
      }
      throw error;
    }
  }

  async findAll({
    skip,
    take,
    cursor,
    where,
    orderBy,
  }: {
    skip?: number;
    take?: number;
    cursor?: Prisma.StockWhereUniqueInput;
    where?: Prisma.StockWhereInput;
    orderBy?: Prisma.StockOrderByWithRelationInput;
  }): Promise<StockEntity[]> {
    try {
      // fetch all stocks with the specified parameters
      return await this.prisma.stock.findMany({
        skip,
        take,
        cursor,
        where: transformWhereInput(where),
        orderBy,
        include: {
          product: true,
          card: {
            include: {
              type: true,
              customer: {
                include: {
                  collector: true,
                },
              },
            },
          },
          agent: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Records not found');
        }
      }
      if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        throw new Error('Invalid query or request');
      }
      if (error instanceof Prisma.PrismaClientRustPanicError) {
        throw new Error('Internal Prisma client error');
      }
      if (error instanceof Prisma.PrismaClientInitializationError) {
        throw new Error('Prisma client initialization error');
      }
      throw error;
    }
  }

  async countAll(): Promise<StockCountEntity> {
    try {
      // find all stocks
      const stocksCount = await this.prisma.stock.count();

      // return stocks count
      return { count: stocksCount };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        throw new Error('Invalid query or request');
      }
      if (error instanceof Prisma.PrismaClientRustPanicError) {
        throw new Error('Internal Prisma client error');
      }
      if (error instanceof Prisma.PrismaClientInitializationError) {
        throw new Error('Prisma client initialization error');
      }
      throw error;
    }
  }

  async countSpecific({
    skip,
    take,
    cursor,
    where,
    orderBy,
  }: {
    skip?: number;
    take?: number;
    cursor?: Prisma.StockWhereUniqueInput;
    where?: Prisma.StockWhereInput;
    orderBy?: Prisma.StockOrderByWithRelationInput;
  }): Promise<StockCountEntity> {
    try {
      // find specific stocks
      const specificStocksCount = await this.prisma.stock.count({
        skip: 0,
        take: (await this.countAll()).count,
        cursor,
        where: transformWhereInput(where),
        orderBy,
      });

      // return stocks count
      return { count: specificStocksCount };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        throw new Error('Invalid query or request');
      }
      if (error instanceof Prisma.PrismaClientRustPanicError) {
        throw new Error('Internal Prisma client error');
      }
      if (error instanceof Prisma.PrismaClientInitializationError) {
        throw new Error('Prisma client initialization error');
      }
      throw error;
    }
  }

  async findOne({ id }: { id: number }): Promise<StockEntity> {
    try {
      // fetch stock with the provided ID
      const stock = await this.prisma.stock.findUnique({
        where: { id },
        include: {
          product: true,
          card: {
            include: {
              type: true,
              customer: {
                include: {
                  collector: true,
                },
              },
            },
          },
          agent: true,
        },
      });

      // throw an error if any stock is found
      if (!stock) {
        throw new Error(`Stock with ID ${id} not found`);
      }

      // return the requested stock
      return stock;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        throw new Error('Invalid query or request');
      }
      if (error instanceof Prisma.PrismaClientRustPanicError) {
        throw new Error('Internal Prisma client error');
      }
      if (error instanceof Prisma.PrismaClientInitializationError) {
        throw new Error('Prisma client initialization error');
      }
      throw error;
    }
  }

  async updateStockManualInput({
    id,
    updateStockManualInputDto,
  }: {
    id: number;
    updateStockManualInputDto: UpdateStockManualInputDto;
  }): Promise<StockEntity> {
    try {
      // fetch stock with the provided ID
      const stock = await this.prisma.stock.findUnique({
        where: { id },
      });

      // throw an error if any stock is found
      if (!stock) {
        throw new Error(`Stock with ID ${id} not found`);
      }

      // check it is stock input and not a retrocession
      if (
        stock.inputQuantity === null ||
        stock.movementType !== StockInputType.manual
      ) {
        throw new Error(`Invalid Stock`);
      }

      // check if the provided agent ID exist
      const agent = await this.prisma.agent.findUnique({
        where: { id: updateStockManualInputDto.agentId },
      });

      // throw an error if not
      if (!agent) {
        throw Error(`Agent not found`);
      }

      // check if the stock is the last movement
      const lastStocks = await this.prisma.stock.findMany({
        orderBy: {
          id: 'desc',
        },
        take: 1,
      });

      // throw an error if not
      if (stock.id !== lastStocks[0].id) {
        throw Error(`Immutable stock`);
      }

      // update the stock data
      const updatedStock = await this.prisma.stock.update({
        where: { id },
        data: {
          ...updateStockManualInputDto,
          stockQuantity:
            stock.stockQuantity -
            stock.inputQuantity +
            updateStockManualInputDto.inputQuantity,
          updatedAt: new Date().toISOString(),
        },
      });

      // emit update event
      this.socketGateway.emitProductEvent({
        event: 'stock-update',
        data: updatedStock,
      });

      return this.findOne({ id });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        throw new Error('Invalid query or request');
      }
      if (error instanceof Prisma.PrismaClientRustPanicError) {
        throw new Error('Internal Prisma client error');
      }
      if (error instanceof Prisma.PrismaClientInitializationError) {
        throw new Error('Prisma client initialization error');
      }
      throw error;
    }
  }

  async updateStockManualOutput({
    id,
    updateStockManualOutputDto,
  }: {
    id: number;
    updateStockManualOutputDto: UpdateStockManualOutputDto;
  }): Promise<StockEntity> {
    try {
      // fetch stock with the provided ID
      const stock = await this.prisma.stock.findUnique({
        where: { id },
      });

      // throw an error if any stock is found
      if (!stock) {
        throw new Error(`Stock with ID ${id} not found`);
      }

      // check it is stock input and not a retrocession
      if (
        stock.outputQuantity === null ||
        stock.movementType !== StockOutputType.manual
      ) {
        throw new Error(`Invalid Stock`);
      }

      // check if the provided agent ID exist
      const agent = await this.prisma.agent.findUnique({
        where: { id: updateStockManualOutputDto.agentId },
      });

      // throw an error if not
      if (!agent) {
        throw Error(`Agent not found`);
      }

      // check if the stock is the last movement
      const lastStocks = await this.prisma.stock.findMany({
        orderBy: {
          id: 'desc',
        },
        take: 1,
      });

      // throw an error if not
      if (stock.id !== lastStocks[0].id) {
        throw Error(`Immutable stock`);
      }

      // check if the stock is sufficient for making an output
      if (
        lastStocks[0].stockQuantity +
          lastStocks[0].outputQuantity -
          updateStockManualOutputDto.outputQuantity <
        0
      ) {
        throw Error('Insufficient stock quantity');
      }

      // update the stock data
      const updatedStock = await this.prisma.stock.update({
        where: { id },
        data: {
          ...updateStockManualOutputDto,
          stockQuantity:
            stock.stockQuantity +
            stock.outputQuantity -
            updateStockManualOutputDto.outputQuantity,
          updatedAt: new Date().toISOString(),
        },
      });

      // emit update event
      this.socketGateway.emitProductEvent({
        event: 'stock-update',
        data: updatedStock,
      });

      return this.findOne({ id });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        throw new Error('Invalid query or request');
      }
      if (error instanceof Prisma.PrismaClientRustPanicError) {
        throw new Error('Internal Prisma client error');
      }
      if (error instanceof Prisma.PrismaClientInitializationError) {
        throw new Error('Prisma client initialization error');
      }
      throw error;
    }
  }

  async remove({ id }: { id: number }): Promise<StockEntity> {
    try {
      // fetch stock with the provided ID
      const stockWithID = await this.prisma.stock.findUnique({
        where: { id },
        include: {
          product: true,
          card: {
            include: {
              type: {
                include: {
                  typeProducts: {
                    include: {
                      product: true,
                    },
                  },
                },
              },
            },
          },
          agent: true,
        },
      });

      // throw an error if any stock is found
      if (!stockWithID) {
        throw new Error(`Stock with ID ${id} not found`);
      }

      // throw error if the stock is not an input or a manual output
      if (stockWithID.movementType !== StockInputType.manual) {
        throw Error('Deletion impossible');
      }

      // check if the stock(movement) is the last of the product
      const lastStock = (
        await this.prisma.stock.findMany({
          where: {
            productId: stockWithID.productId,
          },
        })
      ).pop();

      if (lastStock.id !== stockWithID.id) {
        throw Error('Deletion impossible');
      }

      // remove the specified stock
      await this.prisma.stock.delete({
        where: { id },
      });

      // emit deletion event
      this.socketGateway.emitProductEvent({
        event: 'stock-deletion',
        data: stockWithID,
      });

      // return removed stock
      return stockWithID;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        throw new Error('Invalid query or request');
      }
      if (error instanceof Prisma.PrismaClientRustPanicError) {
        throw new Error('Internal Prisma client error');
      }
      if (error instanceof Prisma.PrismaClientInitializationError) {
        throw new Error('Prisma client initialization error');
      }
      throw error;
    }
  }
}
