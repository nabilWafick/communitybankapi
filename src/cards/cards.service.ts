import { Injectable } from '@nestjs/common';
import { CardDto } from './dto/card.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CardEntity } from './entities/card.entity';
import { isDateString } from 'class-validator';

@Injectable()
export class CardsService {
  constructor(private readonly prisma: PrismaService) {}

  async create({ cardDto }: { cardDto: CardDto }): Promise<CardEntity> {
    try {
      // find all cards  with a label similar to the label provided
      const cardWithLabel = await this.prisma.card.findMany({
        where: {
          label: { contains: cardDto.label, mode: 'insensitive' },
        },
      });

      // loop the result
      for (const card of cardWithLabel) {
        // throw an error if a card have the same label as the label provided
        if (card.label.toLowerCase() === cardDto.label.toLowerCase()) {
          throw new Error('Label already used');
        }
      }

      // check if the provided type ID exist
      const type = await this.prisma.type.findUnique({
        where: { id: cardDto.typeId },
      });

      // throw an error if not
      if (!type) {
        throw Error(`Type not found`);
      }

      // check if the provided customer ID exist
      const customer = await this.prisma.customer.findUnique({
        where: { id: cardDto.customerId },
      });

      // throw an error if not
      if (!customer) {
        throw Error(`Customer not found`);
      }

      // makes null repaid, satisfied and transfered dates if provided
      cardDto.repaidAt = null;
      cardDto.satisfiedAt = null;
      cardDto.transferedAt = null;

      // create a new card
      return this.prisma.card.create({
        data: cardDto,
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
    cursor?: Prisma.CardWhereUniqueInput;
    where?: Prisma.CardWhereInput;
    orderBy?: Prisma.CardOrderByWithRelationInput;
  }): Promise<CardEntity[]> {
    try {
      // fetch all cards with the specified parameters
      return await this.prisma.card.findMany({
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

  async findOne({ id }: { id: number }): Promise<CardEntity> {
    try {
      // fetch card with the provided ID
      const card = await this.prisma.card.findUnique({
        where: { id },
      });

      // throw an error if any card is found
      if (!card) {
        throw new Error(`Card with ID ${id} not found`);
      }

      // return the requested card
      return card;
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
    cardDto,
  }: {
    id: number;
    cardDto: CardDto;
  }): Promise<CardEntity> {
    try {
      // fetch card with the provided ID
      const cardWithID = await this.prisma.card.findUnique({
        where: { id },
      });

      // throw an error if any card is found
      if (!cardWithID) {
        throw new Error(`Card with ID ${id} not found`);
      }

      // find all card with a label to the label provided
      const cardWithLabel = await this.prisma.card.findMany({
        where: {
          label: { contains: cardDto.label, mode: 'insensitive' },
        },
      });

      // loop the result
      for (const card of cardWithLabel) {
        // throw an error if a card have the same label as the label provided
        if (
          card.label.toLowerCase() === cardDto.label.toLowerCase() &&
          card.id != id
        ) {
          throw new Error('Label already used');
        }
      }

      // check if the provided type ID exist
      const type = await this.prisma.type.findUnique({
        where: { id: cardDto.typeId },
      });

      // throw an error if not
      if (!type) {
        throw Error(`Type not found`);
      }

      // check if the provided customer ID exist
      const customer = await this.prisma.customer.findUnique({
        where: { id: cardDto.customerId },
      });

      // throw an error if not
      if (!customer) {
        throw Error(`Customer not found`);
      }

      // check if repaid, satisfied and transfered dates if provided are valid
      if (cardDto.repaidAt && !isDateString(cardDto.repaidAt)) {
        throw Error(`Invalid refund date`);
      }

      if (cardDto.satisfiedAt && !isDateString(cardDto.satisfiedAt)) {
        throw Error(`Invalid satisfaction date`);
      }

      if (cardDto.transferedAt && !isDateString(cardDto.transferedAt)) {
        throw Error(`Invalid transfer date`);
      }

      // update the card data
      return await this.prisma.card.update({
        where: { id },
        data: cardDto,
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

  async remove({ id }: { id: number }): Promise<CardEntity> {
    try {
      // fetch card with the provided ID
      const cardWithID = await this.prisma.card.findUnique({
        where: { id },
      });

      // throw an error if any card is found
      if (!cardWithID) {
        throw new Error(`Card with ID ${id} not found`);
      }

      // remove the specified card
      const card = await this.prisma.card.delete({
        where: { id },
      });

      // return removed card
      return card;
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
