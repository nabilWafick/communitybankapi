import { Injectable } from '@nestjs/common';
import { CreateCollectionDto, UpdateCollectionDto } from './dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CollectionEntity } from './entities/collection.entity';
import { isDateString } from 'class-validator';

@Injectable()
export class CollectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create({
    createCollectionDto,
  }: {
    createCollectionDto: CreateCollectionDto;
  }): Promise<CollectionEntity> {
    try {
      // check if the provided collector ID exist
      const collector = await this.prisma.collector.findUnique({
        where: { id: createCollectionDto.collectorId },
      });

      // throw an error if not
      if (!collector) {
        throw Error(`Collector not found`);
      }

      // check if the provided agent ID exist
      const agent = await this.prisma.customer.findUnique({
        where: { id: createCollectionDto.agentId },
      });

      // throw an error if not
      if (!agent) {
        throw Error(`Agent not found`);
      }

      // create a new collection
      return this.prisma.collection.create({
        data: { ...createCollectionDto, rest: createCollectionDto.amount },
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
    cursor?: Prisma.CollectionWhereUniqueInput;
    where?: Prisma.CollectionWhereInput;
    orderBy?: Prisma.CollectionOrderByWithRelationInput;
  }): Promise<CollectionEntity[]> {
    try {
      // fetch all collections with the specified parameters
      return await this.prisma.collection.findMany({
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

  async findOne({ id }: { id: number }): Promise<CollectionEntity> {
    try {
      // fetch collection with the provided ID
      const collection = await this.prisma.collection.findUnique({
        where: { id },
      });

      // throw an error if any collection is found
      if (!collection) {
        throw new Error(`Collection with ID ${id} not found`);
      }

      // return the requested collection
      return collection;
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
    updateCollectionDto,
  }: {
    id: number;
    updateCollectionDto: UpdateCollectionDto;
  }): Promise<CollectionEntity> {
    try {
      // fetch collection with the provided ID
      const collectionWithID = await this.prisma.collection.findUnique({
        where: { id },
        include: {
          settlement: true,
        },
      });

      // throw an error if any collection is found
      if (!collectionWithID) {
        throw new Error(`Collection with ID ${id} not found`);
      }

      // check if the provided collector ID exist
      const collector = await this.prisma.collector.findUnique({
        where: { id: updateCollectionDto.collectorId },
      });

      // throw an error if not
      if (!collector) {
        throw Error(`Collector not found`);
      }

      // check if the provided agent ID exist
      const agent = await this.prisma.customer.findUnique({
        where: { id: updateCollectionDto.agentId },
      });

      // throw an error if not
      if (!agent) {
        throw Error(`Agent not found`);
      }

      // check if repaid, satisfied and transfered dates if provided are valid
      if (
        updateCollectionDto.collectedAt &&
        !isDateString(updateCollectionDto.collectedAt)
      ) {
        throw Error(`Invalid collection date`);
      }

      // check if the aagent would be modified

      // update the collection data
      return await this.prisma.collection.update({
        where: { id },
        data: updateCollectionDto,
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

  async remove({ id }: { id: number }): Promise<CollectionEntity> {
    try {
      // fetch collection with the provided ID
      const collectionWithID = await this.prisma.collection.findUnique({
        where: { id },
      });

      // throw an error if any collection is found
      if (!collectionWithID) {
        throw new Error(`Collection with ID ${id} not found`);
      }

      // remove the specified collection
      const collection = await this.prisma.collection.delete({
        where: { id },
      });

      // return removed collection
      return collection;
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
