import { Injectable } from '@nestjs/common';
import { Card, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { StockInputType, StockOutputType } from './class';
import {
  CreateStockConstrainedOutputDto,
  CreateStockInputDto,
  CreateStockManualOutputDto,
  CreateStockNormalOutputDto,
  CreateStockRetrocessionDto,
  UpdateStockInputDto,
  UpdateStockManualOutputDto,
} from './dto';
import { StockEntity, StockCountEntity } from './entities';
import { transformWhereInput } from 'src/common/transformer/transformer.service';

@Injectable()
export class StocksService {
  constructor(private readonly prisma: PrismaService) {}

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
  }): Promise<StockEntity[]> {
    let newStocks: StockEntity[];
    for (let i = 0; i < productsIds.length; i++) {
      // get the last product stock
      const productStocks = await this.prisma.stock.findMany({
        where: { productId: productsIds[i] },
        orderBy: {
          id: 'desc',
        },
        take: 1,
      });

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
        },
      });
    }

    // mark the card as satisfied
    await this.prisma.card.update({
      where: {
        id: card.id,
      },
      data: {
        satisfiedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
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
    let newStocks: StockEntity[];

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
    const lastCardStockOutputs = await this.prisma.stock.findMany({
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
      lastCardStockOutputs.length > 0 ? lastCardStockOutputs[0] : null;

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
            initialQuantity: productLastStock.stockQuantity,
            inputQuantity: productLastStock.outputQuantity,
            stockQuantity:
              productLastStock.stockQuantity + productLastStock.outputQuantity,
            movementType: StockInputType.retrocession,
            agentId: agentId,
          },
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
      // are make the same hour
      if (
        lastCardStockOutput.createdAt.getFullYear() ===
          new Date().getFullYear() &&
        lastCardStockOutput.createdAt.getMonth() === new Date().getMonth() &&
        lastCardStockOutput.createdAt.getDate() === new Date().getDate() &&
        lastCardStockOutput.createdAt.getHours() === new Date().getHours()
      ) {
        throw Error('Multiple retrocession per hour impossible');
      } else {
        // last retrocession done is not at this hours

        // fetch all products outputed for the card that hours
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
              ).toISOString(),
              lt: new Date(
                card.satisfiedAt.getFullYear(),
                card.satisfiedAt.getMonth(),
                card.satisfiedAt.getDate(),
                card.satisfiedAt.getHours() + 1,
                0,
                0,
              ).toISOString(),
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
                initialQuantity: productLastStock.stockQuantity,
                inputQuantity: productOutputedStock.outputQuantity,
                stockQuantity:
                  productLastStock.stockQuantity +
                  productOutputedStock.outputQuantity,
                movementType: StockInputType.retrocession,
                agentId: agentId,
              },
            });
          }
        }
      }
    }

    // pass satisfied at date to null
    await this.prisma.card.update({
      where: {
        id: card.id,
      },
      data: {
        satisfiedAt: null,
        updatedAt: new Date().toISOString(),
      },
    });

    return newStocks;
  }

  async createStockInput({
    createStockInputDto,
  }: {
    createStockInputDto: CreateStockInputDto;
  }): Promise<StockEntity> {
    try {
      // check if the provided agent ID exist
      const agent = await this.prisma.agent.findUnique({
        where: { id: createStockInputDto.agentId },
      });

      // throw an error if not
      if (!agent) {
        throw Error(`Agent not found`);
      }

      // check if the provided product ID exist
      const product = await this.prisma.product.findUnique({
        where: { id: createStockInputDto.productId },
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
          ...createStockInputDto,
          initialQuantity: 0,
          stockQuantity: createStockInputDto.inputQuantity,
          movementType: StockInputType.manual,
        };
      } else {
        // complete the stock
        newStock = {
          ...createStockInputDto,
          initialQuantity: lastProductStock.stockQuantity,
          stockQuantity:
            lastProductStock.stockQuantity + createStockInputDto.inputQuantity,
          movementType: StockInputType.manual,
        };
      }

      // create a new stock
      return this.prisma.stock.create({
        data: newStock,
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
      return this.prisma.stock.create({
        data: {
          ...createStockManualOutputDto,
          initialQuantity: lastProductStock.stockQuantity,
          stockQuantity:
            lastProductStock.stockQuantity -
            createStockManualOutputDto.outputQuantity,
          movementType: StockOutputType.manual,
        },
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
        },
      });

      // throw an error if not
      if (!card) {
        throw Error(`Card not found`);
      }

      // check all the product availability
      const isAllProductsAvailable = this.checkProductsStocksAvailability({
        productsIds: card.type.typeProducts.map(
          (productType) => productType.productId,
        ),
        productsOutputQuantities: card.type.typeProducts.map(
          (productType) => productType.productNumber,
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
          (productType) => productType.productNumber,
        ),
        outputType: StockOutputType.normal,
        agentId: createStockNormalOutputDto.agentId,
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
        },
      });

      // throw an error if not
      if (!card) {
        throw Error(`Card not found`);
      }

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
      const isAllProductsAvailable = this.checkProductsStocksAvailability({
        productsIds: createStockConstrainedOutputDto.productsIds,
        productsOutputQuantities:
          createStockConstrainedOutputDto.productsOutputQuantities,
      });

      // throw error, if one of products are not available in stock
      // or it astock quantity is not sufficient
      if (!isAllProductsAvailable) {
        throw Error('Products not available');
      }

      // make outputs
      return await this.outputProducts({
        card: card,
        productsIds: createStockConstrainedOutputDto.productsIds,
        productsOutputQuantities:
          createStockConstrainedOutputDto.productsOutputQuantities,
        outputType: StockOutputType.constraint,
        agentId: createStockConstrainedOutputDto.agentId,
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
          card: true,
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

  async updateStockInput({
    id,
    updateStockInputDto,
  }: {
    id: number;
    updateStockInputDto: UpdateStockInputDto;
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
        where: { id: updateStockInputDto.agentId },
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
      return await this.prisma.stock.update({
        where: { id },
        data: {
          ...updateStockInputDto,
          stockQuantity:
            stock.stockQuantity -
            stock.inputQuantity +
            updateStockInputDto.inputQuantity,
          updatedAt: new Date().toISOString(),
        },
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
      return await this.prisma.stock.update({
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
      });

      // throw an error if any stock is found
      if (!stockWithID) {
        throw new Error(`Stock with ID ${id} not found`);
      }

      // throw error if the stock is not an input or a manual output
      if (stockWithID.movementType !== StockInputType.manual) {
        throw Error('Deletion impossible');
      }
      // remove the specified stock
      const stock = await this.prisma.stock.delete({
        where: { id },
      });

      // return removed stock
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
}
