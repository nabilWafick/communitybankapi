import { Injectable } from '@nestjs/common';
import { AgentDto } from './dto/agents.dto';
import { Prisma, PrismaClient, Agent } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AgentEntity } from './entities/agents.entity';

@Injectable()
export class AgentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create({ agentDto }: { agentDto: AgentDto }): Promise<AgentEntity> {
    try {
      // find any agent with the provided email
      const agentWithEmail = await this.prisma.agent.findUnique({
        where: { email: agentDto.email },
      });

      // throw an error if an agent is found
      if (agentWithEmail) {
        throw new Error('Email already used');
      }

      // find any agent with the provided phone number
      const agentWithPhoneNumber = await this.prisma.agent.findUnique({
        where: { phoneNumber: agentDto.phoneNumber },
      });

      // throw an error if an agent is found
      if (agentWithPhoneNumber) {
        throw new Error('Phone number already used');
      }

      // create a new agent
      return this.prisma.agent.create({
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
      // fetch all agents with the specified parameters
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
      // fetch agent with the provided ID
      const agent = await this.prisma.agent.findUnique({
        where: { id },
      });

      // throw an error if any agent is found
      if (!agent) {
        throw new Error(`Agent with ID ${id} not found`);
      }

      // return the requested agent
      return agent;
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
    agentDto,
  }: {
    id: number;
    agentDto: AgentDto;
  }): Promise<Agent> {
    console.log({ agentDto: agentDto });
    try {
      // fetch agent with the provided ID
      const agentWithID = await this.prisma.agent.findUnique({
        where: { id },
      });

      // throw an error if any agent is found
      if (!agentWithID) {
        throw new Error(`Agent with ID ${id} not found`);
      }

      // find any agent with the provided email
      const agentWithEmail = await this.prisma.agent.findUnique({
        where: { email: agentDto.email },
      });

      // throw an error if an agent is found and it is not the requested agent
      if (agentWithEmail && agentWithEmail.id != id) {
        throw new Error('Email already used');
      }

      // find any agent with the provided phone number
      const agentWithPhoneNumber = await this.prisma.agent.findUnique({
        where: { phoneNumber: agentDto.phoneNumber },
      });

      // throw an error if an agent is found and it is not the requested agent
      if (agentWithPhoneNumber && agentWithPhoneNumber.id != id) {
        throw new Error('Phone number already used');
      }

      // update the agent data
      return await this.prisma.agent.update({
        where: { id },
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

  async remove({ id }: { id: number }): Promise<AgentEntity> {
    try {
      // fetch agent with the provided ID
      const agentWithID = await this.prisma.agent.findUnique({
        where: { id },
      });

      // throw an error if any agent is found
      if (!agentWithID) {
        throw new Error(`Agent with ID ${id} not found`);
      }

      // remove the specified agent
      const agent = await this.prisma.agent.delete({ where: { id } });

      // return removed agent
      return agent;
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
