import { Injectable } from '@nestjs/common';
import { CreateModificationDto, UpdateModificationDto } from './dto';
import { Prisma, PrismaClient, Modification } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ModificationEntity } from './entities/modification.entity';

@Injectable()
export class ModificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create({
    createModificationDto,
  }: {
    createModificationDto: CreateModificationDto;
  }): Promise<ModificationEntity> {
    try {
      // check if there is an agent identified by the specified ID
      const agent = await this.prisma.agent.findUnique({
        where: { id: createModificationDto.agentId },
      });

      // throw an error if there is no agent
      if (!agent) {
        throw new Error(
          `Agent with ID ${createModificationDto.agentId} not found`,
        );
      }

      // create a new modification
      return this.prisma.modification.create({
        data: createModificationDto,
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
    cursor?: Prisma.ModificationWhereUniqueInput;
    where?: Prisma.ModificationWhereInput;
    orderBy?: Prisma.ModificationOrderByWithRelationInput;
  }): Promise<ModificationEntity[]> {
    try {
      // fetch all modifications with the specified parameters
      return await this.prisma.modification.findMany({
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

  async findOne({ id }: { id: number }): Promise<ModificationEntity> {
    try {
      // fetch modification with the provided ID
      const modification = await this.prisma.modification.findUnique({
        where: { id },
      });

      // throw an error if any modification is found
      if (!modification) {
        throw new Error(`Modification with ID ${id} not found`);
      }

      // return the requested modification
      return modification;
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
    updateModificationDto,
  }: {
    id: number;
    updateModificationDto: UpdateModificationDto;
  }): Promise<ModificationEntity> {
    try {
      // fetch modification with the provided ID
      const modificationWithID = await this.prisma.modification.findUnique({
        where: { id },
      });

      // throw an error if any modification is found
      if (!modificationWithID) {
        throw new Error(`Modification with ID ${id} not found`);
      }

      // check if there is an agent identified by the specified ID
      const agent = await this.prisma.agent.findUnique({
        where: { id: updateModificationDto.agentId },
      });

      // throw an error if there is no agent
      if (!agent) {
        throw new Error(
          `Agent with ID ${updateModificationDto.agentId} not found`,
        );
      }

      // update the modification data
      return await this.prisma.modification.update({
        where: { id },
        data: updateModificationDto,
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

  async remove({ id }: { id: number }): Promise<ModificationEntity> {
    try {
      // fetch modification with the provided ID
      const modificationWithID = await this.prisma.modification.findUnique({
        where: { id },
      });

      // throw an error if any modification is found
      if (!modificationWithID) {
        throw new Error(`Modification with ID ${id} not found`);
      }

      // remove the specified modification
      const modification = await this.prisma.modification.delete({
        where: { id },
      });

      // return removed modification
      return modification;
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
