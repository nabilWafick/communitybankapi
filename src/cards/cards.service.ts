import { Injectable } from '@nestjs/common';
import { CreateCardDto, UpdateCardDto } from './dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CardEntity } from './entities/card.entity';
import { isDateString } from 'class-validator';

@Injectable()
export class CardsService {
  constructor(private readonly prisma: PrismaService) {}

  async create({
    createCardDto,
  }: {
    createCardDto: CreateCardDto;
  }): Promise<CardEntity> {
    try {
      // find all cards  with a label similar to the label provided
      const cardWithLabel = await this.prisma.card.findMany({
        where: {
          label: { contains: createCardDto.label, mode: 'insensitive' },
        },
      });

      // loop the result
      for (const card of cardWithLabel) {
        // throw an error if a card have the same label as the label provided
        if (card.label.toLowerCase() === createCardDto.label.toLowerCase()) {
          throw new Error('Label already used');
        }
      }

      // check if the provided type ID exist
      const type = await this.prisma.type.findUnique({
        where: { id: createCardDto.typeId },
      });

      // throw an error if not
      if (!type) {
        throw Error(`Type not found`);
      }

      // check if the provided customer ID exist
      const customer = await this.prisma.customer.findUnique({
        where: { id: createCardDto.customerId },
      });

      // throw an error if not
      if (!customer) {
        throw Error(`Customer not found`);
      }

      // create a new card
      return this.prisma.card.create({
        data: createCardDto,
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
    updateCardDto,
  }: {
    id: number;
    updateCardDto: UpdateCardDto;
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
          label: { contains: updateCardDto.label, mode: 'insensitive' },
        },
      });

      // loop the result
      for (const card of cardWithLabel) {
        // throw an error if a card have the same label as the label provided
        if (
          card.label.toLowerCase() === updateCardDto.label.toLowerCase() &&
          card.id != id
        ) {
          throw new Error('Label already used');
        }
      }

      // check if the provided type ID exist
      const type = await this.prisma.type.findUnique({
        where: { id: updateCardDto.typeId },
      });

      // throw an error if not
      if (!type) {
        throw Error(`Type not found`);
      }

      // check if the provided customer ID exist
      const customer = await this.prisma.customer.findUnique({
        where: { id: updateCardDto.customerId },
      });

      // throw an error if not
      if (!customer) {
        throw Error(`Customer not found`);
      }

      // check it two card end dates are provided at the same time
      if (updateCardDto.repaidAt && updateCardDto.satisfiedAt) {
        throw Error('Refund and Satisfaction dates provided');
      }

      if (updateCardDto.repaidAt && updateCardDto.transferedAt) {
        throw Error('Refund and Transfer dates provided');
      }

      if (updateCardDto.satisfiedAt && updateCardDto.transferedAt) {
        throw Error('Satisfaction and Transfer dates provided');
      }

      // check if repaid, satisfied and transfered dates if provided are valid
      if (updateCardDto.repaidAt && !isDateString(updateCardDto.repaidAt)) {
        throw Error(`Invalid refund date`);
      }

      if (
        updateCardDto.satisfiedAt &&
        !isDateString(updateCardDto.satisfiedAt)
      ) {
        throw Error(`Invalid satisfaction date`);
      }

      if (
        updateCardDto.transferedAt &&
        !isDateString(updateCardDto.transferedAt)
      ) {
        throw Error(`Invalid transfer date`);
      }

      // update the card data
      return await this.prisma.card.update({
        where: { id },
        data: updateCardDto,
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
