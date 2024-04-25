import { Injectable } from '@nestjs/common';
import { PersonalStatusDto } from './dto/personal_status.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PersonalStatusEntity } from './entities/personal_status.entity';

@Injectable()
export class PersonalStatusService {
  constructor(private readonly prisma: PrismaService) {}

  async create({
    personalStatusDto,
  }: {
    personalStatusDto: PersonalStatusDto;
  }): Promise<PersonalStatusEntity> {
    try {
      // find all personalStatus with a name similar to the name provided
      const personalStatusWithName = await this.prisma.personalStatus.findMany({
        where: {
          name: { contains: personalStatusDto.name, mode: 'insensitive' },
        },
      });

      // loop the result
      for (const personalStatus of personalStatusWithName) {
        // throw an error if a personalStatus have the same name as the name provided
        if (
          personalStatus.name.toLowerCase() ===
          personalStatusDto.name.toLowerCase()
        ) {
          throw new Error('Name already used');
        }
      }

      // create a new personalStatus
      return this.prisma.personalStatus.create({
        data: personalStatusDto,
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
    cursor?: Prisma.PersonalStatusWhereUniqueInput;
    where?: Prisma.PersonalStatusWhereInput;
    orderBy?: Prisma.PersonalStatusOrderByWithRelationInput;
  }): Promise<PersonalStatusEntity[]> {
    try {
      // fetch all personalStatuss with the specified parameters
      return await this.prisma.personalStatus.findMany({
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

  async findOne({ id }: { id: number }): Promise<PersonalStatusEntity> {
    try {
      // fetch personalStatus with the provided ID
      const personalStatus = await this.prisma.personalStatus.findUnique({
        where: { id },
      });

      // throw an error if any personalStatus is found
      if (!personalStatus) {
        throw new Error(`personalStatus with ID ${id} not found`);
      }

      // return the requested personalStatus
      return personalStatus;
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
    personalStatusDto,
  }: {
    id: number;
    personalStatusDto: PersonalStatusDto;
  }): Promise<PersonalStatusEntity> {
    try {
      // fetch personalStatus with the provided ID
      const personalStatusWithID = await this.prisma.personalStatus.findUnique({
        where: { id },
      });

      // throw an error if any personalStatus is found
      if (!personalStatusWithID) {
        throw new Error(`personalStatus with ID ${id} not found`);
      }

      // find all personalStatus with a name to the name provided
      const personalStatusWithName = await this.prisma.personalStatus.findMany({
        where: {
          name: { contains: personalStatusDto.name, mode: 'insensitive' },
        },
      });

      // loop the result
      for (const personalStatus of personalStatusWithName) {
        // throw an error if a personalStatus have the same name as the name provided
        if (
          personalStatus.name.toLowerCase() ===
            personalStatusDto.name.toLowerCase() &&
          personalStatus.id != id
        ) {
          throw new Error('Name already used');
        }
      }

      // update the personalStatus data
      return await this.prisma.personalStatus.update({
        where: { id },
        data: personalStatusDto,
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

  async remove({ id }: { id: number }): Promise<PersonalStatusEntity> {
    try {
      // fetch personalStatus with the provided ID
      const personalStatusWithID = await this.prisma.personalStatus.findUnique({
        where: { id },
      });

      // throw an error if any personalStatus is found
      if (!personalStatusWithID) {
        throw new Error(`personalStatus with ID ${id} not found`);
      }

      // remove the specified personalStatus
      const personalStatus = await this.prisma.personalStatus.delete({
        where: { id },
      });

      // return removed personalStatus
      return personalStatus;
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
