import { Injectable } from '@nestjs/common';
import { CreateCollectionDto, UpdateCollectionDto } from './dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CollectionEntity, CollectionCountEntity } from './entities';
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

      // check if collection date is valid
      if (
        createCollectionDto.collectedAt &&
        !isDateString(createCollectionDto.collectedAt)
      ) {
        throw Error(`Invalid collection date`);
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
        include: {
          collector: true,
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

  async countAll(): Promise<CollectionCountEntity> {
    try {
      // find all collections
      const collections = await this.prisma.collection.findMany();

      // return collections count
      return { count: collections.length };
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
    cursor?: Prisma.CollectionWhereUniqueInput;
    where?: Prisma.CollectionWhereInput;
    orderBy?: Prisma.CollectionOrderByWithRelationInput;
  }): Promise<CollectionCountEntity> {
    try {
      // find all collection
      const collection = await this.prisma.collection.findMany();
      // find specific collections
      const specificCollections = await this.prisma.collection.findMany({
        skip: 0,
        take: collection.length,
        cursor,
        where,
        orderBy,
      });

      // return collections count
      return { count: specificCollections.length };
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
      const collection = await this.prisma.collection.findUnique({
        where: { id },
        include: {
          settlements: true,
        },
      });

      // throw an error if any collection is found
      if (!collection) {
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

      // check if collection date if provided is valid
      if (
        updateCollectionDto.collectedAt &&
        !isDateString(updateCollectionDto.collectedAt)
      ) {
        throw Error(`Invalid collection date`);
      }

      // check if collection would be update
      if (
        updateCollectionDto.collectedAt &&
        collection.collectedAt != updateCollectionDto.collectedAt
      ) {
        // check if there is at least one settlement maked with the collection
        if (collection.settlements.length > 0) {
          throw Error('Collection date immutable');
        }
      }

      // check if the agent would be modified
      if (
        updateCollectionDto.agentId &&
        collection.agentId != updateCollectionDto.agentId
      ) {
        throw Error('Agent immutable');
      }

      // check if the collector would be modified
      if (
        updateCollectionDto.collectorId &&
        collection.collectorId != updateCollectionDto.collectorId
      ) {
        // check if there is at least one settlement maked with the collection
        if (collection.settlements.length > 0) {
          throw Error('Collector immutable');
        }
      }

      // check if the amount would be modified
      if (
        updateCollectionDto.amount &&
        collection.amount != updateCollectionDto.amount
      ) {
        // check if there is at least one settlement maked with the collection
        if (collection.settlements.length > 0) {
          throw Error('Amount immutable');
        }
      }

      // update the collection data
      return await this.prisma.collection.update({
        where: { id },
        data: {
          ...updateCollectionDto,
          rest: updateCollectionDto.amount,
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

  async increaseAmount({
    id,
    updateCollectionDto,
  }: {
    id: number;
    updateCollectionDto: UpdateCollectionDto;
  }): Promise<CollectionEntity> {
    try {
      // fetch collection with the provided ID
      const collection = await this.prisma.collection.findUnique({
        where: { id },
        include: {
          settlements: true,
        },
      });

      // throw an error if any collection is found
      if (!collection) {
        throw new Error(`Collection with ID ${id} not found`);
      }

      // if the amount to increase have not been passed
      if (!updateCollectionDto.amount) {
        return collection;
      }

      // update the collection data
      return await this.prisma.collection.update({
        where: { id },
        data: {
          amount: collection.amount.add(updateCollectionDto.amount),
          rest: collection.rest.add(updateCollectionDto.amount),
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

  async decreaseAmount({
    id,
    updateCollectionDto,
  }: {
    id: number;
    updateCollectionDto: UpdateCollectionDto;
  }): Promise<CollectionEntity> {
    try {
      // fetch collection with the provided ID
      const collection = await this.prisma.collection.findUnique({
        where: { id },
        include: {
          settlements: true,
        },
      });

      // throw an error if any collection is found
      if (!collection) {
        throw new Error(`Collection with ID ${id} not found`);
      }

      // if the amount to increase have not been passed
      if (!updateCollectionDto.amount) {
        return collection;
      }

      if (
        collection.rest.toNumber() - updateCollectionDto.amount.toNumber() <
        0
      ) {
        throw Error('Insufficient amount');
      }

      // update the collection data
      return await this.prisma.collection.update({
        where: { id },
        data: {
          amount: collection.amount.minus(updateCollectionDto.amount),
          rest: collection.rest.minus(updateCollectionDto.amount),
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
