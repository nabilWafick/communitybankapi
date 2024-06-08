import { Injectable } from '@nestjs/common';
import { CreateCollectionDto, UpdateCollectionDto } from './dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CollectionEntity, CollectionCountEntity } from './entities';
import { isDateString } from 'class-validator';
import { equal } from 'assert';
import { AjustCollectionAmount } from './dto/ajust-collection-amount.dto';
import { transformWhereInput } from 'src/common/transformer/transformer.service';

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
      const agent = await this.prisma.agent.findUnique({
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

      console.log({ collector: createCollectionDto.collectorId });

      // check if the collector have already a collection made that day
      const collectorCollections = await this.prisma.collection.findMany({
        where: {
          collectorId: createCollectionDto.collectorId,
        },
      });

      const collectionDate = new Date(createCollectionDto.collectedAt);

      for (const collectorCollection of collectorCollections) {
        if (
          collectorCollection.collectedAt.getFullYear() ===
            collectionDate.getFullYear() &&
          collectorCollection.collectedAt.getMonth() ===
            collectionDate.getMonth() &&
          collectorCollection.collectedAt.getDate() === collectionDate.getDate()
        ) {
          throw Error('Collection already made');
        }
      }

      // create a new collection
      const collection = await this.prisma.collection.create({
        data: { ...createCollectionDto, rest: createCollectionDto.amount },
      });

      return this.findOne({ id: collection.id });
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
        where: transformWhereInput(where),
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
      const collectionsCount = await this.prisma.collection.count();

      // return collections count
      return { count: collectionsCount };
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
      // find specific collections
      const specificCollectionsCount = await this.prisma.collection.count({
        skip: 0,
        take: (await this.countAll()).count,
        cursor,
        where: transformWhereInput(where),
        orderBy,
      });

      // return collections count
      return { count: specificCollectionsCount };
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
        include: {
          collector: true,
          agent: true,
        },
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
      const agent = await this.prisma.agent.findUnique({
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

      const collectionDate = new Date(updateCollectionDto.collectedAt);

      // check if collection date would be update
      if (
        collection.collectedAt.getFullYear() !== collectionDate.getFullYear() ||
        collection.collectedAt.getMonth() !== collectionDate.getMonth() ||
        collection.collectedAt.getDate() !== collectionDate.getDate()
      ) {
        // check if there is at least one settlement maked with the collection
        if (collection.settlements.length > 0) {
          throw Error('Collection date immutable');
        }

        console.log('collection date would be update');

        // check if the collector have not made a collection at the new date
        const collectorCollections = await this.prisma.collection.findMany({
          where: {
            collectorId: updateCollectionDto.collectorId,
          },
        });

        for (const collectorCollection of collectorCollections) {
          if (
            collectorCollection.collectedAt.getFullYear() ===
              collectionDate.getFullYear() &&
            collectorCollection.collectedAt.getMonth() ===
              collectionDate.getMonth() &&
            collectorCollection.collectedAt.getDate() ===
              collectionDate.getDate()
          ) {
            throw Error('Collection already made');
          }
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
      await this.prisma.collection.update({
        where: { id },
        data: {
          ...updateCollectionDto,
          rest: updateCollectionDto.amount,
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

  async increaseAmount({
    id,
    ajustCollectionAmount,
  }: {
    id: number;
    ajustCollectionAmount: AjustCollectionAmount;
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

      // update the collection data
      await this.prisma.collection.update({
        where: { id },
        data: {
          amount: collection.amount.add(ajustCollectionAmount.amount),
          rest: collection.rest.add(ajustCollectionAmount.amount),
          updatedAt: new Date().toISOString(),
        },
      });

      // return the updated collection
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

  async decreaseAmount({
    id,
    ajustCollectionAmount,
  }: {
    id: number;
    ajustCollectionAmount: AjustCollectionAmount;
  }): Promise<CollectionEntity> {
    try {
      // fetch collection with the provided ID
      const collection = await this.prisma.collection.findUnique({
        where: { id },
      });

      // throw an error if any collection is found
      if (!collection) {
        throw new Error(`Collection with ID ${id} not found`);
      }

      // check if the rest of collection can be decrease
      if (collection.rest.minus(ajustCollectionAmount.amount).toNumber() < 0) {
        throw Error('Insufficient amount');
      }

      // update the collection data
      await this.prisma.collection.update({
        where: { id },
        data: {
          amount: collection.amount.minus(ajustCollectionAmount.amount),
          rest: collection.rest.minus(ajustCollectionAmount.amount),
          updatedAt: new Date().toISOString(),
        },
      });

      // return the updated collection
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

  async remove({ id }: { id: number }): Promise<CollectionEntity> {
    try {
      // fetch collection with the provided ID
      const collectionWithID = await this.prisma.collection.findUnique({
        where: { id },
        include: {
          collector: true,
          agent: true,
        },
      });

      // throw an error if any collection is found
      if (!collectionWithID) {
        throw new Error(`Collection with ID ${id} not found`);
      }

      // remove the specified collection
      await this.prisma.collection.delete({
        where: { id },
      });

      // return removed collection
      return collectionWithID;
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
