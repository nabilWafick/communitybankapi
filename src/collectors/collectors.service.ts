import { Injectable } from '@nestjs/common';
import { CreateCollectorDto, UpdateCollectorDto } from './dto';
import { Prisma, PrismaClient, Collector } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CollectorEntity, CollectorCountEntity } from './entities';

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
}
