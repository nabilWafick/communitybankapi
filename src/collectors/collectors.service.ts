import { Injectable } from '@nestjs/common';
import { CreateCollectorDto, UpdateCollectorDto } from './dto';
import { Prisma, PrismaClient, Collector } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CollectorEntity,
  CollectorCountEntity,
  CollectorCollection,
} from './entities';

@Injectable()
export class CollectorsService {
  constructor(private readonly prisma: PrismaService) {}

  async create({
    createCollectorDto,
  }: {
    createCollectorDto: CreateCollectorDto;
  }): Promise<CollectorEntity> {
    try {
      // find any collector with the provided phone number
      const collectorWithPhoneNumber = await this.prisma.collector.findUnique({
        where: { phoneNumber: createCollectorDto.phoneNumber },
      });

      // throw an error if an collector is found
      if (collectorWithPhoneNumber) {
        throw new Error('Phone number already used');
      }

      // create a new collector
      return this.prisma.collector.create({
        data: createCollectorDto,
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
    cursor?: Prisma.CollectorWhereUniqueInput;
    where?: Prisma.CollectorWhereInput;
    orderBy?: Prisma.CollectorOrderByWithRelationInput;
  }): Promise<CollectorEntity[]> {
    try {
      // fetch all collectors with the specified parameters
      return await this.prisma.collector.findMany({
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

  async countAll(): Promise<CollectorCountEntity> {
    try {
      // find all collectors
      const collectorsCount = await this.prisma.collector.count();

      // return collectors count
      return { count: collectorsCount };
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
    cursor?: Prisma.CollectorWhereUniqueInput;
    where?: Prisma.CollectorWhereInput;
    orderBy?: Prisma.CollectorOrderByWithRelationInput;
  }): Promise<CollectorCountEntity> {
    try {
      // find specific collectors
      const specificCollectorsCount = await this.prisma.collector.count({
        skip: 0,
        take: (await this.countAll()).count,
        cursor,
        where,
        orderBy,
      });

      // return collectors count
      return { count: specificCollectorsCount };
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

  async findOne({ id }: { id: number }): Promise<CollectorEntity> {
    try {
      // fetch collector with the provided ID
      const collector = await this.prisma.collector.findUnique({
        where: { id },
      });

      // throw an error if any collector is found
      if (!collector) {
        throw new Error(`Collector with ID ${id} not found`);
      }

      // return the requested collector
      return collector;
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
    updateCollectorDto,
  }: {
    id: number;
    updateCollectorDto: UpdateCollectorDto;
  }): Promise<CollectorEntity> {
    try {
      // fetch collector with the provided ID
      const collectorWithID = await this.prisma.collector.findUnique({
        where: { id },
      });

      // throw an error if any collector is found
      if (!collectorWithID) {
        throw new Error(`Collector with ID ${id} not found`);
      }

      // find any collector with the provided phone number
      const collectorWithPhoneNumber = await this.prisma.collector.findUnique({
        where: { phoneNumber: updateCollectorDto.phoneNumber },
      });

      // throw an error if an collector is found and it is not the requested collector
      if (collectorWithPhoneNumber && collectorWithPhoneNumber.id != id) {
        throw new Error('Phone number already used');
      }

      // update the collector data
      return await this.prisma.collector.update({
        where: { id },
        data: { ...updateCollectorDto, updatedAt: new Date().toISOString() },
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

  async remove({ id }: { id: number }): Promise<CollectorEntity> {
    try {
      // fetch collector with the provided ID
      const collectorWithID = await this.prisma.collector.findUnique({
        where: { id },
      });

      // throw an error if any collector is found
      if (!collectorWithID) {
        throw new Error(`Collector with ID ${id} not found`);
      }

      // remove the specified collector
      const collector = await this.prisma.collector.delete({ where: { id } });

      // return removed collector
      return collector;
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

  async getGlobalCollections({
    skip,
    take,
    where,
    orderBy,
  }: {
    skip?: number;
    take?: number;
    where?: Prisma.CollectorWhereInput;
    orderBy?: Prisma.CollectorOrderByWithRelationInput;
  }): Promise<CollectorCollection[]> {
    try {
      const collectionSumPerCollector = await this.prisma.collector.findMany({
        skip,
        take,
        where,
        orderBy,
        select: {
          id: true,
          name: true,
          firstnames: true,
          phoneNumber: true,
          collections: {
            select: {
              amount: true,
              collectedAt: true,
            },
          },

          _count: {
            select: { collections: true },
          },
        },
      });

      const result = collectionSumPerCollector.map(
        (collector) =>
          new CollectorCollection(
            collector.id,
            collector.name,
            collector.firstnames,
            collector.phoneNumber,
            collector._count.collections,
            collector.collections.reduce(
              (sum, collection) => sum + collection.amount.toNumber() ?? 0,
              0,
            ),
            collector.collections.length > 0
              ? collector.collections[collector.collections.length - 1]
                  .collectedAt
              : new Date(),
          ),
      );

      return result;
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

  async getDayCollections({
    skip,
    take,
    where,
    orderBy,
  }: {
    skip?: number;
    take?: number;
    where?: Prisma.CollectorWhereInput;
    orderBy?: Prisma.CollectorOrderByWithRelationInput;
  }): Promise<CollectorCollection[]> {
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      startOfDay.setDate(startOfDay.getDate() - startOfDay.getDay());

      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 6);
      endOfDay.setHours(23, 59, 59, 999);

      const collectionSumPerCollectorThisDay =
        await this.prisma.collector.findMany({
          skip,
          take,
          where,
          orderBy,
          select: {
            id: true,
            name: true,
            firstnames: true,
            phoneNumber: true,
            collections: {
              where: {
                collectedAt: {
                  gte: startOfDay,
                  lte: endOfDay,
                },
              },
              select: {
                amount: true,
                collectedAt: true,
              },
            },
            _count: {
              select: {
                collections: {
                  where: {
                    collectedAt: {
                      gte: startOfDay,
                      lte: endOfDay,
                    },
                  },
                },
              },
            },
          },
        });

      const result = collectionSumPerCollectorThisDay.map(
        (collector) =>
          new CollectorCollection(
            collector.id,
            collector.name,
            collector.firstnames,
            collector.phoneNumber,
            collector._count.collections,
            collector.collections.reduce(
              (sum, collection) => sum + collection.amount.toNumber() ?? 0,
              0,
            ),
            collector.collections.length > 0
              ? collector.collections[collector.collections.length - 1]
                  .collectedAt
              : new Date(),
          ),
      );
      return result;
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

  async getWeekCollections({
    skip,
    take,
    where,
    orderBy,
  }: {
    skip?: number;
    take?: number;
    where?: Prisma.CollectorWhereInput;
    orderBy?: Prisma.CollectorOrderByWithRelationInput;
  }): Promise<CollectorCollection[]> {
    try {
      const startOfWeek = new Date();
      startOfWeek.setHours(0, 0, 0, 0);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const collectionSumPerCollectorThisWeek =
        await this.prisma.collector.findMany({
          skip,
          take,
          where,
          orderBy,
          select: {
            id: true,
            name: true,
            firstnames: true,
            phoneNumber: true,
            collections: {
              where: {
                collectedAt: {
                  gte: startOfWeek,
                  lte: endOfWeek,
                },
              },
              select: {
                amount: true,
                collectedAt: true,
              },
            },
            _count: {
              select: {
                collections: {
                  where: {
                    collectedAt: {
                      gte: startOfWeek,
                      lte: endOfWeek,
                    },
                  },
                },
              },
            },
          },
        });

      const result = collectionSumPerCollectorThisWeek.map(
        (collector) =>
          new CollectorCollection(
            collector.id,
            collector.name,
            collector.firstnames,
            collector.phoneNumber,
            collector._count.collections,
            collector.collections.reduce(
              (sum, collection) => sum + collection.amount.toNumber() ?? 0,
              0,
            ),
            collector.collections.length > 0
              ? collector.collections[collector.collections.length - 1]
                  .collectedAt
              : new Date(),
          ),
      );
      return result;
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

  async getMonthCollections({
    skip,
    take,
    where,
    orderBy,
  }: {
    skip?: number;
    take?: number;
    where?: Prisma.CollectorWhereInput;
    orderBy?: Prisma.CollectorOrderByWithRelationInput;
  }): Promise<CollectorCollection[]> {
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

      const collectionSumPerCollectorThisMonth =
        await this.prisma.collector.findMany({
          skip,
          take,
          where,
          orderBy,
          select: {
            id: true,
            name: true,
            firstnames: true,
            phoneNumber: true,
            collections: {
              where: {
                collectedAt: {
                  gte: startOfMonth,
                  lte: endOfMonth,
                },
              },
              select: {
                amount: true,
                collectedAt: true,
              },
            },
            _count: {
              select: {
                collections: {
                  where: {
                    collectedAt: {
                      gte: startOfMonth,
                      lte: endOfMonth,
                    },
                  },
                },
              },
            },
          },
        });

      const result = collectionSumPerCollectorThisMonth.map(
        (collector) =>
          new CollectorCollection(
            collector.id,
            collector.name,
            collector.firstnames,
            collector.phoneNumber,
            collector._count.collections,
            collector.collections.reduce(
              (sum, collection) => sum + collection.amount.toNumber() ?? 0,
              0,
            ),
            collector.collections.length > 0
              ? collector.collections[collector.collections.length - 1]
                  .collectedAt
              : new Date(),
          ),
      );

      return result;
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

  async getYearCollections({
    skip,
    take,
    where,
    orderBy,
  }: {
    skip?: number;
    take?: number;
    where?: Prisma.CollectorWhereInput;
    orderBy?: Prisma.CollectorOrderByWithRelationInput;
  }): Promise<CollectorCollection[]> {
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

      const collectionSumPerCollectorThisYear =
        await this.prisma.collector.findMany({
          skip,
          take,
          where,
          orderBy,
          select: {
            id: true,
            name: true,
            firstnames: true,
            phoneNumber: true,
            collections: {
              where: {
                collectedAt: {
                  gte: startOfYear,
                  lte: endOfYear,
                },
              },
              select: {
                amount: true,
                collectedAt: true,
              },
            },
            _count: {
              select: {
                collections: {
                  where: {
                    collectedAt: {
                      gte: startOfYear,
                      lte: endOfYear,
                    },
                  },
                },
              },
            },
          },
        });

      const result = collectionSumPerCollectorThisYear.map(
        (collector) =>
          new CollectorCollection(
            collector.id,
            collector.name,
            collector.firstnames,
            collector.phoneNumber,
            collector._count.collections,
            collector.collections.reduce(
              (sum, collection) => sum + collection.amount.toNumber() ?? 0,
              0,
            ),
            collector.collections.length > 0
              ? collector.collections[collector.collections.length - 1]
                  .collectedAt
              : new Date(),
          ),
      );

      return result;
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
}
