import { Injectable } from '@nestjs/common';
import { AgentDto } from './dto';
import { Prisma, PrismaClient, Agent } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AgentEntity } from './entities/agents.entity';

@Injectable()
export class AgentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create({ agentDto }: { agentDto: AgentDto }): Promise<AgentEntity> {
    try {
      const agentWithEmail = this.prisma.agent.findUnique({
        where: { email: agentDto.email },
      });

      if (agentWithEmail) {
        throw new Error('Email already used');
      }

      return await this.prisma.agent.create({
        data: agentDto,
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
    cursor?: Prisma.AgentWhereUniqueInput;
    where?: Prisma.AgentWhereInput;
    orderBy?: Prisma.AgentOrderByWithRelationInput;
  }): Promise<AgentEntity[]> {
    try {
      return await this.prisma.agent.findMany({
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

  async findOne({ id }: { id: number }) {
    try {
      const agent = await this.prisma.agent.findUnique({
        where: { id },
      });
      if (!agent) {
        throw new Error(`Entity with ID ${id} not found`);
      }
      return agent;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Record not found');
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

  async update({ id, agent }: { id: number; agent: AgentDto }): Promise<Agent> {
    try {
      return await this.prisma.agent.update({
        where: { id },
        data: agent,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('Unique constraint violation');
        }
        /* if (error.code === 'P2003') {
          throw new Error('Foreign key constraint violation');
        }*/
        if (error.code === 'P2025') {
          throw new Error('Record not found');
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

  async remove({ id }: { id: number }): Promise<AgentEntity> {
    try {
      const agent = await this.prisma.agent.delete({ where: { id } });
      if (!agent) {
        throw new Error(`Record with ID ${id} not found`);
      }
      return agent;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Record not found');
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
