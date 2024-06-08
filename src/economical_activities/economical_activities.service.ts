import { Injectable } from '@nestjs/common';
import {
  CreateEconomicalActivityDto,
  UpdateEconomicalActivityDto,
} from './dto';
import { Prisma, PrismaClient, EconomicalActivity } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  EconomicalActivityEntity,
  EconomicalActivityCountEntity,
} from './entities';
import { transformWhereInput } from 'src/common/transformer/transformer.service';

@Injectable()
export class EconomicalActivitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create({
    createEconomicalActivityDto,
  }: {
    createEconomicalActivityDto: CreateEconomicalActivityDto;
  }): Promise<EconomicalActivityEntity> {
    try {
      // find all economicalActivities with a name similar to the name provided
      const economicalActivitiesWithName =
        await this.prisma.economicalActivity.findMany({
          where: {
            name: {
              contains: createEconomicalActivityDto.name,
              mode: 'insensitive',
            },
          },
        });

      // loop the result
      for (const economicalActivity of economicalActivitiesWithName) {
        // throw an error if a economicalActivity have the same name as the name provided
        if (
          economicalActivity.name.toLowerCase() ===
          createEconomicalActivityDto.name.toLowerCase()
        ) {
          throw new Error('Name already used');
        }
      }

      // create a new economicalActivity
      return this.prisma.economicalActivity.create({
        data: createEconomicalActivityDto,
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
    cursor?: Prisma.EconomicalActivityWhereUniqueInput;
    where?: Prisma.EconomicalActivityWhereInput;
    orderBy?: Prisma.EconomicalActivityOrderByWithRelationInput;
  }): Promise<EconomicalActivityEntity[]> {
    try {
      // fetch all economicalActivitys with the specified parameters
      return await this.prisma.economicalActivity.findMany({
        skip,
        take,
        cursor,
        where: transformWhereInput(where),
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

  async countAll(): Promise<EconomicalActivityCountEntity> {
    try {
      // find all economicalActivities
      const economicalActivitiesCount =
        await this.prisma.economicalActivity.count();

      // return economicalActivities count
      return { count: economicalActivitiesCount };
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
    cursor?: Prisma.EconomicalActivityWhereUniqueInput;
    where?: Prisma.EconomicalActivityWhereInput;
    orderBy?: Prisma.EconomicalActivityOrderByWithRelationInput;
  }): Promise<EconomicalActivityCountEntity> {
    try {
      // find specific economicalActivities
      const specificEconomicalActivitiesCount =
        await this.prisma.economicalActivity.count({
          skip: 0,
          take: (await this.countAll()).count,
          cursor,
          where,
          orderBy,
        });

      // return economicalActivities count
      return { count: specificEconomicalActivitiesCount };
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

  async findOne({ id }: { id: number }): Promise<EconomicalActivityEntity> {
    try {
      // fetch economicalActivity with the provided ID
      const economicalActivity =
        await this.prisma.economicalActivity.findUnique({
          where: { id },
        });

      // throw an error if any economicalActivity is found
      if (!economicalActivity) {
        throw new Error(`EconomicalActivity with ID ${id} not found`);
      }

      // return the requested economicalActivity
      return economicalActivity;
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
    updateEconomicalActivityDto,
  }: {
    id: number;
    updateEconomicalActivityDto: UpdateEconomicalActivityDto;
  }): Promise<EconomicalActivityEntity> {
    try {
      // fetch economicalActivity with the provided ID
      const economicalActivityWithID =
        await this.prisma.economicalActivity.findUnique({
          where: { id },
        });

      // throw an error if any economicalActivity is found
      if (!economicalActivityWithID) {
        throw new Error(`EconomicalActivity with ID ${id} not found`);
      }

      // find all economicalActivities with a name to the name provided
      const economicalActivitiesWithName =
        await this.prisma.economicalActivity.findMany({
          where: {
            name: {
              contains: updateEconomicalActivityDto.name,
              mode: 'insensitive',
            },
          },
        });

      // loop the result
      for (const economicalActivity of economicalActivitiesWithName) {
        // throw an error if a economicalActivity have the same name as the name provided
        if (
          economicalActivity.name.toLowerCase() ===
            updateEconomicalActivityDto.name.toLowerCase() &&
          economicalActivity.id != id
        ) {
          throw new Error('Name already used');
        }
      }

      // update the economicalActivity data
      return await this.prisma.economicalActivity.update({
        where: { id },
        data: {
          ...updateEconomicalActivityDto,
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

  async remove({ id }: { id: number }): Promise<EconomicalActivityEntity> {
    try {
      // fetch economicalActivity with the provided ID
      const economicalActivityWithID =
        await this.prisma.economicalActivity.findUnique({
          where: { id },
        });

      // throw an error if any economicalActivity is found
      if (!economicalActivityWithID) {
        throw new Error(`EconomicalActivity with ID ${id} not found`);
      }

      // remove the specified economicalActivity
      const economicalActivity = await this.prisma.economicalActivity.delete({
        where: { id },
      });

      // return removed economicalActivity
      return economicalActivity;
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
