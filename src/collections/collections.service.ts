import { Injectable } from '@nestjs/common';
import { CreateCollectionDto, UpdateCollectionDto } from './dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CollectionEntity, CollectionCountEntity } from './entities';
import { isDateString } from 'class-validator';
import { equal } from 'assert';
import { AjustCollectionAmount } from './dto/ajust-collection-amount.dto';
import { transformWhereInput } from 'src/common/transformer/transformer.service';
import { CollectorCountEntity } from 'src/collectors/entities';
import { SocketGateway } from 'src/common/socket/socket.gateway';

@Injectable()
export class CollectionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly socketGateway: SocketGateway,
  ) {}

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

      if (collectionDate > new Date()) {
        throw Error('Invalid collection date');
      }

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
      const newCollection = await this.prisma.collection.create({
        data: { ...createCollectionDto, rest: createCollectionDto.amount },
      });

      // emit addition event
      this.socketGateway.emitProductEvent({
        event: 'collection-addition',
        data: newCollection,
      });

      return this.findOne({ id: newCollection.id });
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

  async countAll({
    where,
  }: {
    where?: Prisma.CollectionWhereInput;
  }): Promise<CollectionCountEntity> {
    try {
      // find all collections
      const collectionsCount = await this.prisma.collection.count({ where });

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

  async sumAll({
    where,
  }: {
    where?: Prisma.CollectionWhereInput;
  }): Promise<CollectionCountEntity> {
    try {
      // find all collections
      const collectionsSum = await this.prisma.collection.aggregate({
        where,

        _sum: {
          amount: true,
        },
      });

      // return collections count
      return { count: collectionsSum._sum.amount?.toNumber() ?? 0 };
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

  async sumAllRest({
    where,
  }: {
    where?: Prisma.CollectionWhereInput;
  }): Promise<CollectionCountEntity> {
    try {
      // find all collections
      const collectionsRestSum = await this.prisma.collection.aggregate({
        where,
        _sum: {
          rest: true,
        },
      });

      // return collections count
      return { count: collectionsRestSum._sum.rest?.toNumber() ?? 0 };
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
        take: (await this.countAll({})).count,
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

  async sumSpecific({
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
      const specificCollectionsSum = await this.prisma.collection.aggregate({
        skip: 0,
        take: (await this.countAll({})).count,
        cursor,
        where: transformWhereInput(where),
        orderBy,
        _sum: {
          amount: true,
        },
      });

      // return collections count
      return { count: specificCollectionsSum._sum.amount?.toNumber() ?? 0 };
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

  async sumSpecificRest({
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
      const specificCollectionsRestSum = await this.prisma.collection.aggregate(
        {
          skip: 0,
          take: (await this.countAll({ where: null })).count,
          cursor,
          where: transformWhereInput(where),
          orderBy,
          _sum: {
            rest: true,
          },
        },
      );

      // return collections count
      return { count: specificCollectionsRestSum._sum.rest?.toNumber() ?? 0 };
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
      // for avoiding erasing the veritable author
      updateCollectionDto = { ...updateCollectionDto, agentId: null };

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
      const updatedCollection = await this.prisma.collection.update({
        where: { id },
        data: {
          ...updateCollectionDto,
          rest: updateCollectionDto.amount,
          updatedAt: new Date().toISOString(),
        },
      });

      // emit update event
      this.socketGateway.emitProductEvent({
        event: 'collection-update',
        data: updatedCollection,
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

      // emit deletion event
      this.socketGateway.emitProductEvent({
        event: 'collection-deletion',
        data: collectionWithID,
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

  async getDayCollection(): Promise<CollectorCountEntity> {
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      //  startOfDay.setDate(startOfDay.getDate() - startOfDay.getDay());

      const endOfDay = new Date(startOfDay);
      endOfDay.setHours(23, 59, 59, 999);

      const collectionSumDay = await this.prisma.collection.aggregate({
        where: {
          collectedAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        _sum: {
          amount: true,
        },
      });

      return { count: collectionSumDay._sum.amount?.toNumber() ?? 0 };
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

  async getWeekCollection(): Promise<CollectorCountEntity> {
    try {
      const startOfWeek = new Date();
      startOfWeek.setHours(0, 0, 0, 0);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const collectionSumWeek = await this.prisma.collection.aggregate({
        where: {
          collectedAt: {
            gte: startOfWeek,
            lte: endOfWeek,
          },
        },
        _sum: {
          amount: true,
        },
      });

      return { count: collectionSumWeek._sum.amount?.toNumber() ?? 0 };
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

  async getMonthCollection(): Promise<CollectorCountEntity> {
    try {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );

      const collectionSumMonth = await this.prisma.collection.aggregate({
        where: {
          collectedAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        _sum: {
          amount: true,
        },
      });

      return { count: collectionSumMonth._sum.amount?.toNumber() ?? 0 };
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

  async getYearCollection(): Promise<CollectorCountEntity> {
    try {
      const startOfYear = new Date(new Date().getFullYear(), 0, 1);
      const endOfYear = new Date(
        new Date().getFullYear(),
        11,
        31,
        23,
        59,
        59,
        999,
      );

      const collectionSumYear = await this.prisma.collection.aggregate({
        where: {
          collectedAt: {
            gte: startOfYear,
            lte: endOfYear,
          },
        },
        _sum: {
          amount: true,
        },
      });

      return { count: collectionSumYear._sum.amount?.toNumber() ?? 0 };
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

  /*
  async profit(): Promise<CollectionCountEntity> {
    try {
      // sum all collections
      const collectionsSum = await this.prisma.collection.aggregate({
        _sum: {
          amount: true,
        },
      });

      // get all repaid, satisfied and transferred card
      const satisfiedCards = await this.prisma.card.findMany({
        where: {
          NOT: {
            repaidAt: null,
          },
        },
        include: {
          type: true,
          settlements: true,
        },
      });

      let amountRepaid = 0;

      // calculate the amount repaid
      for (const satisfiedCard of satisfiedCards) {
        //  validated settlements of the settlement card
        const validatedSettlements = satisfiedCard.settlements.filter(
          (settlement) => settlement.isValidated,
        );

        // calculate the total of validated settlements
        const validatedSettlementsTotal = validatedSettlements.reduce(
          (total, settlement) => total + settlement.number,
          0,
        );

        amountRepaid +=
          satisfiedCard.typesNumber *
          satisfiedCard.type.stake.toNumber() *
          validatedSettlementsTotal;

        // substract customer card fee
        amountRepaid -= 300;
      }

      let stockProductsAmount = 0;
      // calculate the sum of the purchase price of all product added to stock
      // get all input without input from retrocession
      const stockEntries = await this.prisma.stock.findMany({
        where: {
          AND: {
            inputQuantity: {
              not: null,
            },
            cardId: null,
          },
        },
        include: {
          product: true,
        },
      });

      for (const stockEntry of stockEntries) {
        stockProductsAmount +=
          stockEntry.inputQuantity *
          stockEntry.product.purchasePrice.toNumber();
      }

      // return collections count
      return {
        count:
          (collectionsSum._sum.amount?.toNumber() ?? 0) -
          (amountRepaid + stockProductsAmount),
      };
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
  */

  /// ***** Claude AI suggestion *****
  async profit(): Promise<CollectionCountEntity> {
    try {
      // 1. Sum all collections
      const collectionsSum = await this.prisma.collection.aggregate({
        _sum: {
          amount: true,
        },
      });

      // 2. Get only satisfied and repaid cards that haven't been transferred
      const satisfiedCards = await this.prisma.card.findMany({
        where: {
          AND: {
            repaidAt: { not: null }, // Card has been repaid
            satisfiedAt: { not: null }, // Card has received its products
            transferredAt: null, // Card hasn't been transferred
          },
        },
        include: {
          type: true,
          settlements: true,
        },
      });

      let amountRepaid = 0;

      // Calculate the amount repaid for each valid card
      for (const satisfiedCard of satisfiedCards) {
        // Get only validated settlements for this card
        const validatedSettlements = satisfiedCard.settlements.filter(
          (settlement) => settlement.isValidated,
        );

        // Sum up all validated settlements
        const validatedSettlementsTotal = validatedSettlements.reduce(
          (total, settlement) => total + settlement.number,
          0,
        );

        // Calculate total repaid amount:
        // typesNumber * stake * total settlements
        amountRepaid +=
          satisfiedCard.typesNumber *
          satisfiedCard.type.stake.toNumber() *
          validatedSettlementsTotal;

        // Subtract card fee
        amountRepaid -= 300;
      }

      // 3. Calculate stock costs
      let stockProductsAmount = 0;
      // Get all stock inputs (excluding retrocessions)
      const stockEntries = await this.prisma.stock.findMany({
        where: {
          AND: {
            inputQuantity: {
              not: null,
            },
            cardId: null, // Exclude retrocessions
          },
        },
        include: {
          product: true,
        },
      });

      // Calculate total stock purchase cost
      for (const stockEntry of stockEntries) {
        stockProductsAmount +=
          stockEntry.inputQuantity *
          stockEntry.product.purchasePrice.toNumber();
      }

      // 4. Calculate final profit
      return {
        count:
          (collectionsSum._sum.amount?.toNumber() ?? 0) -
          (amountRepaid + stockProductsAmount),
      };
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

  async yearProfit(): Promise<CollectionCountEntity> {
    try {
      // Get start and end of current year
      const currentYear = new Date().getFullYear();
      const startOfYear = new Date(currentYear, 0, 1); // January 1st
      const endOfYear = new Date(currentYear + 1, 0, 1); // January 1st next year

      // 1. Sum collections for current year
      const collectionsSum = await this.prisma.collection.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          collectedAt: {
            gte: startOfYear,
            lt: endOfYear,
          },
        },
      });

      // 2. Get satisfied and repaid cards from current year
      const satisfiedCards = await this.prisma.card.findMany({
        where: {
          AND: {
            repaidAt: {
              not: null,
              gte: startOfYear,
              lt: endOfYear,
            },
            satisfiedAt: { not: null },
            transferredAt: null,
          },
        },
        include: {
          type: true,
          settlements: {
            where: {
              createdAt: {
                gte: startOfYear,
                lt: endOfYear,
              },
            },
          },
        },
      });

      let amountRepaid = 0;

      // Calculate the amount repaid for each valid card
      for (const satisfiedCard of satisfiedCards) {
        const validatedSettlements = satisfiedCard.settlements.filter(
          (settlement) => settlement.isValidated,
        );

        const validatedSettlementsTotal = validatedSettlements.reduce(
          (total, settlement) => total + settlement.number,
          0,
        );

        amountRepaid +=
          satisfiedCard.typesNumber *
          satisfiedCard.type.stake.toNumber() *
          validatedSettlementsTotal;

        amountRepaid -= 300;
      }

      // 3. Calculate stock costs for current year
      let stockProductsAmount = 0;
      const stockEntries = await this.prisma.stock.findMany({
        where: {
          AND: {
            inputQuantity: {
              not: null,
            },
            cardId: null,
            createdAt: {
              gte: startOfYear,
              lt: endOfYear,
            },
          },
        },
        include: {
          product: true,
        },
      });

      for (const stockEntry of stockEntries) {
        stockProductsAmount +=
          stockEntry.inputQuantity *
          stockEntry.product.purchasePrice.toNumber();
      }

      // 4. Calculate final profit
      return {
        count:
          (collectionsSum._sum.amount?.toNumber() ?? 0) -
          (amountRepaid + stockProductsAmount),
      };
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
