import { Injectable } from '@nestjs/common';
import {
  CreateStockInputDto,
  UpdateStockInputDto,
  CreateStockNormalRetrocessionDto,
  UpdateStockNormalRetrocessionDto,
  Cre,
  CreateStockManualOutputDto,
  CreateStockNormalOutputDto,
} from './dto';
import { Prisma, Stock } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { StockEntity } from './entities/stock.entity';
import { isDateString } from 'class-validator';

@Injectable()
export class StocksService {
  constructor(private readonly prisma: PrismaService) {}

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
        };
      } else {
        // complete the stock
        newStock = {
          ...createStockInputDto,
          initialQuantity: lastProductStock.stockQuantity,
          stockQuantity:
            lastProductStock.stockQuantity + createStockInputDto.inputQuantity,
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
        throw Error('Insufficient stock');
      }

      // create a new stock
      return this.prisma.stock.create({
        data: {
          ...createStockManualOutputDto,
          initialQuantity: lastProductStock.stockQuantity,
          stockQuantity:
            lastProductStock.stockQuantity -
            createStockManualOutputDto.outputQuantity,
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
  }): Promise<StockEntity> {
    try {
      // check if the provided agent ID exist
      const agent = await this.prisma.agent.findUnique({
        where: { id: createStockNormalOutputDto.agentId },
      });

      // throw an error if not
      if (!agent) {
        throw Error(`Agent not found`);
      }

      // check if the provided product ID exist
      const card = await this.prisma.card.findUnique({
        where: { id: createStockNormalOutputDto.cardId },
        include: {
          type: true,
        },
      });

      // throw an error if not
      if (!card) {
        throw Error(`Card not found`);
      }

      // try to get last product stock
      const lastProductStocks = await this.prisma.stock.findMany({
        where: { id: product.id },
        orderBy: {
          id: 'desc',
        },
        take: 1,
      });

      const lastProductStock =
        lastProductStocks.length > 0 ? lastProductStocks[0] : null;

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
        throw Error('Insufficient stock');
      }

      // create a new stock
      return this.prisma.stock.create({
        data: {
          ...createStockManualOutputDto,
          initialQuantity: lastProductStock.stockQuantity,
          stockQuantity:
            lastProductStock.stockQuantity -
            createStockManualOutputDto.outputQuantity,
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
        where,
        orderBy,
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

  async findOne({ id }: { id: number }): Promise<StockEntity> {
    try {
      // fetch stock with the provided ID
      const stock = await this.prisma.stock.findUnique({
        where: { id },
      });

      // throw an error if any stock is found
      if (!stock) {
        throw new Error(`stock with ID ${id} not found`);
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

  async update({
    id,
    updateStockDto,
  }: {
    id: number;
    updateStockDto: UpdateStockDto;
  }): Promise<StockEntity> {
    try {
      // fetch stock with the provided ID
      const stock = await this.prisma.stock.findUnique({
        where: { id },
      });

      // throw an error if any stock is found
      if (!stock) {
        throw new Error(`stock with ID ${id} not found`);
      }

      // check if the stock can be update
      if (stock.validatedAt) {
        throw Error('stock already validated');
      }

      if (stock.rejectedAt) {
        throw Error('stock already rejected');
      }

      // check if the provided agent ID exist
      const agent = await this.prisma.agent.findUnique({
        where: { id: updateStockDto.agentId },
      });

      // throw an error if not
      if (!agent) {
        throw Error(`Agent not found`);
      }

      // check if the provided issuing card ID exist
      const issuingCard = await this.prisma.card.findUnique({
        where: { id: updateStockDto.issuingCardId },
        include: {
          type: true,
          settlements: true,
        },
      });

      // throw an error if not
      if (!issuingCard) {
        throw Error(`Issuing card not found`);
      }

      // check if the provided receiving card ID exist
      const receivingCard = await this.prisma.card.findUnique({
        where: { id: updateStockDto.receivingCardId },
        include: {
          type: true,
        },
      });

      // throw an error if not
      if (!receivingCard) {
        throw Error(`Receiving card not found`);
      }

      // check if issuing card would be updated
      if (updateStockDto.issuingCardId != stock.issuingCardId) {
        throw Error('Issuing card immutable');
      }

      // check if receiving card would be updated
      if (updateStockDto.receivingCardId != stock.receivingCardId) {
        throw Error('Receiving card immutable');
      }

      // check it two stock status dates are provided at the same time
      if (updateStockDto.validatedAt && updateStockDto.rejectedAt) {
        throw Error('Validation and Rejection dates provided');
      }

      // check if validation, rejection dates if provided are valid
      if (
        updateStockDto.validatedAt &&
        !isDateString(updateStockDto.validatedAt)
      ) {
        throw Error(`Invalid validation date`);
      }

      if (
        updateStockDto.rejectedAt &&
        !isDateString(updateStockDto.rejectedAt)
      ) {
        throw Error(`Invalid rejection date`);
      }

      // make stock if it is validation
      if (updateStockDto.validatedAt) {
        // fetch all settlements of issuing card calculate the total amount

        // fetch all validated settlements of the issuingCard
        const validatedSettlements = issuingCard.settlements.filter(
          (settlement) => settlement.isValidated,
        );

        // calculate the total of validated settlements
        const validatedSettlementsTotal = validatedSettlements.reduce(
          (total, settlement) => total + settlement.number,
          0,
        );

        // calculate the amount of all validated settlements
        const issuingCardSettlementsAmount =
          validatedSettlementsTotal *
          issuingCard.typesNumber *
          issuingCard.type.stake.toNumber();

        // calculate the amount to stockt
        const transfAmount = Math.round(
          (2 * issuingCardSettlementsAmount) / 3 - 300,
        );

        // calculate the number of settlement that the receiving card will receive
        const settlementsReceived = Math.round(
          transfAmount /
            (receivingCard.typesNumber * receivingCard.type.stake.toNumber()),
        );

        if (settlementsReceived < 1) {
          throw Error('Insufficient settlements');
        }

        // update issuing card, mark it as stocked
        this.prisma.card.update({
          where: {
            id: issuingCard.id,
          },
          data: {
            stockedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        });

        // add settlement to receiving card
        this.prisma.settlement.create({
          data: {
            number: settlementsReceived,
            cardId: receivingCard.id,
            collectionId: null,
            agentId: stock.agentId,
            isValidated: true,
          },
        });
      }

      // update the stock data
      return await this.prisma.stock.update({
        where: { id },
        data: { ...updateStockDto, updatedAt: new Date().toISOString() },
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
      const stockWith = await this.prisma.stock.findUnique({
        where: { id },
      });

      // throw an error if any stock is found
      if (!stockWith) {
        throw new Error(`stock with ID ${id} not found`);
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
