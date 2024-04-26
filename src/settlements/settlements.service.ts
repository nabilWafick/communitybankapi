import { Injectable } from '@nestjs/common';
import { CreateSettlementDto, UpdateSettlementDto } from './dto';
import { Prisma, Agent } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { SettlementEntity } from './entities/settlement.entity';
import { isDateString } from 'class-validator';

@Injectable()
export class SettlementsService {
  constructor(private readonly prisma: PrismaService) {}

  async create({
    createSettlementDto,
  }: {
    createSettlementDto: CreateSettlementDto;
  }): Promise<SettlementEntity> {
    try {
      // check if the settlement validated
      if (!createSettlementDto.isValidated) {
        throw Error('Unvalidated settlement');
      }

      // check if the provided agent ID exist
      const agent = await this.prisma.agent.findUnique({
        where: { id: createSettlementDto.agentId },
      });

      // throw an error if not
      if (!agent) {
        throw Error(`Agent not found`);
      }

      // check if the provided card ID exist
      const card = await this.prisma.card.findUnique({
        where: { id: createSettlementDto.cardId },
        include: {
          settlements: true,
        },
      });

      // throw an error if not
      if (!card) {
        throw Error(`Card not found`);
      }

      // check if the card is usable
      if (card.repaidAt) {
        throw Error(`Card already repaid`);
      }

      if (card.satisfiedAt) {
        throw Error(`Card already satisfied`);
      }

      if (card.transferedAt) {
        throw Error(`Card already transfered`);
      }

      // check if the provided collection ID exist
      const collection = await this.prisma.collection.findUnique({
        where: { id: createSettlementDto.collectionId },
      });

      // throw an error if not
      if (!collection) {
        throw Error(`Collection not found`);
      }

      // check if the total of validated settlements done before
      // plus the settlement to add is greater than 372
      // (the maximum number of validated settlements of a customer card)

      // fetch all validated settlements of the customer card
      const validatedSettlements = card.settlements.filter(
        (settlement) => settlement.isValidated === true,
      );

      // create a new settlement
      return this.prisma.settlement.create({
        data: createSettlementDto,
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
    cursor?: Prisma.SettlementWhereUniqueInput;
    where?: Prisma.SettlementWhereInput;
    orderBy?: Prisma.SettlementOrderByWithRelationInput;
  }): Promise<SettlementEntity[]> {
    try {
      // fetch all settlements with the specified parameters
      return await this.prisma.settlement.findMany({
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

  async findOne({ id }: { id: number }): Promise<SettlementEntity> {
    try {
      // fetch settlement with the provided ID
      const settlement = await this.prisma.settlement.findUnique({
        where: { id },
      });

      // throw an error if any settlement is found
      if (!settlement) {
        throw new Error(`Settlement with ID ${id} not found`);
      }

      // return the requested settlement
      return settlement;
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
    updateSettlementDto,
  }: {
    id: number;
    updateSettlementDto: UpdateSettlementDto;
  }): Promise<SettlementEntity> {
    try {
      // fetch settlement with the provided ID
      const settlement = await this.prisma.settlement.findUnique({
        where: { id },
      });

      // throw an error if any settlement is found
      if (!settlement) {
        throw new Error(`Settlement with ID ${id} not found`);
      }

      // update the settlement data
      return await this.prisma.settlement.update({
        where: { id },
        data: updateSettlementDto,
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

  async remove({ id }: { id: number }): Promise<SettlementEntity> {
    try {
      // fetch settlement with the provided ID
      const settlementWithID = await this.prisma.settlement.findUnique({
        where: { id },
      });

      // throw an error if any settlement is found
      if (!settlementWithID) {
        throw new Error(`Settlement with ID ${id} not found`);
      }

      // remove the specified settlement
      const settlement = await this.prisma.settlement.delete({
        where: { id },
      });

      // return removed settlement
      return settlement;
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
