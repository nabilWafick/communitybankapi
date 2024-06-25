import { Injectable } from '@nestjs/common';
import { CreateModificationDto, UpdateModificationDto } from './dto';
import { Prisma, PrismaClient, Modification } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ModificationEntity, ModificationCountEntity } from './entities';
import { SocketGateway } from 'src/common/socket/socket.gateway';

@Injectable()
export class ModificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly socketGateway: SocketGateway,
  ) {}

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
      const newModification = await this.prisma.modification.create({
        data: createModificationDto,
      });

      // emit addition event
      this.socketGateway.emitProductEvent({
        event: 'modification-addition',
        data: newModification,
      });

      return newModification;
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

  async countAll(): Promise<ModificationCountEntity> {
    try {
      // find all modifications
      const modifications = await this.prisma.modification.findMany();

      // return modifications count
      return { count: modifications.length };
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
    cursor?: Prisma.ModificationWhereUniqueInput;
    where?: Prisma.ModificationWhereInput;
    orderBy?: Prisma.ModificationOrderByWithRelationInput;
  }): Promise<ModificationCountEntity> {
    try {
      // find all modification
      const modification = await this.prisma.modification.findMany();
      // find specific modifications
      const specificmodifications = await this.prisma.modification.findMany({
        skip: 0,
        take: modification.length,
        cursor,
        where,
        orderBy,
      });

      // return modifications count
      return { count: specificmodifications.length };
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
      const updatedModification = await this.prisma.modification.update({
        where: { id },
        data: { ...updateModificationDto, updatedAt: new Date().toISOString() },
      });

      // emit update event
      this.socketGateway.emitProductEvent({
        event: 'modification-update',
        data: updatedModification,
      });

      return updatedModification;
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

      // emit deletion event
      this.socketGateway.emitProductEvent({
        event: 'modification-deletion',
        data: modification,
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
