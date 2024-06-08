import { Injectable } from '@nestjs/common';
import { CreateCardDto, UpdateCardDto } from './dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CardEntity, CardCountEntity } from './entities';
import { isDateString } from 'class-validator';
import { transformWhereInput } from 'src/common/transformer/transformer.service';

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
      const cards = await this.prisma.card.findMany({
        skip,
        take,
        cursor,
        where: transformWhereInput(where),
        orderBy,
        include: {
          customer: true,
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
      });

      // sort cards by customer
      return cards.sort((card1, card2) => card1.customerId - card2.customerId);
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

  async countAll(): Promise<CardCountEntity> {
    try {
      // find all cards
      const cardsCount = await this.prisma.card.count();

      // return cards count
      return { count: cardsCount };
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
    cursor?: Prisma.CardWhereUniqueInput;
    where?: Prisma.CardWhereInput;
    orderBy?: Prisma.CardOrderByWithRelationInput;
  }): Promise<CardCountEntity> {
    try {
      // find specific cards
      const specificCardsCount = await this.prisma.card.count({
        skip: 0,
        take: (await this.countAll()).count,
        cursor,
        where: transformWhereInput(where),
        orderBy,
      });

      await this.prisma.type.findMany();

      // return cards count
      return { count: specificCardsCount };
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

  async findOne({ id }: { id: number }): Promise<CardEntity> {
    try {
      // fetch card with the provided ID
      const card = await this.prisma.card.findUnique({
        where: { id },
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
          customer: true,
        },
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
        include: {
          settlements: true,
        },
      });

      // throw an error if any card is found
      if (!cardWithID) {
        throw new Error(`Card with ID ${id} not found`);
      }

      // check if the card is usable
      if (cardWithID.satisfiedAt) {
        throw Error('Card already satisfied');
      }

      if (cardWithID.transferredAt) {
        throw Error('Card already transfered');
      }

      // repayment date can be passed to null
      // if it have been update by mistake
      if (cardWithID.repaidAt && updateCardDto.repaidAt !== null) {
        throw Error('Card already repaid');
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

      // check if the type would be update
      if (updateCardDto.typeId) {
        if (cardWithID.typeId != updateCardDto.typeId) {
          // check if a settlement have be done on customer card
          if (cardWithID.settlements.length > 0) {
            throw 'Type Immutable';
          }
        }
      }

      // check if the provided customer ID exist
      const customer = await this.prisma.customer.findUnique({
        where: { id: updateCardDto.customerId },
      });

      if (cardWithID.customerId != updateCardDto.customerId) {
        // check if a settlement have be done on customer card
        if (cardWithID.settlements.length > 0) {
          throw 'Customer Immutable';
        }
      }

      // throw an error if not
      if (!customer) {
        throw Error(`Customer not found`);
      }

      // check if repaid date if provided is valid

      if (
        typeof updateCardDto.repaidAt === 'string' &&
        !isDateString(updateCardDto.repaidAt)
      ) {
        throw Error(`Invalid refund date`);
      }

      // update the card data
      await this.prisma.card.update({
        where: { id },
        data: {
          label: updateCardDto.label,
          typesNumber: updateCardDto.typesNumber,
          customerId: updateCardDto.customerId,
          typeId: updateCardDto.typeId,
          repaidAt: updateCardDto.repaidAt,
          updatedAt: new Date().toISOString(),
        },
      });

      return this.findOne({ id: id });
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
