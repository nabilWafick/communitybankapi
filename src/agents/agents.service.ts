import { Injectable } from '@nestjs/common';
import { CreateAgentDto, UpdateAgentDto } from './dto';
import { Prisma, PrismaClient, Agent } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AgentEntity, AgentCountEntity } from './entities';
import { transformWhereInput } from 'src/common/transformer/transformer.service';
@Injectable()
export class AgentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create({
    createAgentDto,
  }: {
    createAgentDto: CreateAgentDto;
  }): Promise<AgentEntity> {
    try {
      // find any agent with the provided email
      const agentWithEmail = await this.prisma.agent.findUnique({
        where: { email: createAgentDto.email },
      });

      // throw an error if an agent is found
      if (agentWithEmail) {
        throw new Error('Email already used');
      }

      // find any agent with the provided phone number
      const agentWithPhoneNumber = await this.prisma.agent.findUnique({
        where: { phoneNumber: createAgentDto.phoneNumber },
      });

      // throw an error if an agent is found
      if (agentWithPhoneNumber) {
        throw new Error('Phone number already used');
      }

      // create a new agent
      return this.prisma.agent.create({
        data: {
          ...createAgentDto,
          permissions: JSON.parse(createAgentDto.permissions.toString()),
          views: JSON.parse(createAgentDto.views.toString()),
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
        where: transformWhereInput(where),
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

  async countAll(): Promise<AgentCountEntity> {
    try {
      // find all agents
      const agentsCount = await this.prisma.agent.count();

      // return agents count
      return { count: agentsCount };
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
    cursor?: Prisma.AgentWhereUniqueInput;
    where?: Prisma.AgentWhereInput;
    orderBy?: Prisma.AgentOrderByWithRelationInput;
  }): Promise<AgentCountEntity> {
    try {
      // find specific agents
      const specificAgentsCount = await this.prisma.agent.count({
        skip: 0,
        take: (await this.countAll()).count,
        cursor,
        where: transformWhereInput(where),
        orderBy,
      });

      // return agents count
      return { count: specificAgentsCount };
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

  async findOne({ id }: { id: number }): Promise<AgentEntity> {
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
    updateAgentDto,
  }: {
    id: number;
    updateAgentDto: UpdateAgentDto;
  }): Promise<AgentEntity> {
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
        where: { email: updateAgentDto.email },
      });

      // throw an error if an agent is found and it is not the requested agent
      if (agentWithEmail && agentWithEmail.id != id) {
        throw new Error('Email already used');
      }

      // find any agent with the provided phone number
      const agentWithPhoneNumber = await this.prisma.agent.findUnique({
        where: { phoneNumber: updateAgentDto.phoneNumber },
      });

      // throw an error if an agent is found and it is not the requested agent
      if (agentWithPhoneNumber && agentWithPhoneNumber.id != id) {
        throw new Error('Phone number already used');
      }

      // update the agent data
      return await this.prisma.agent.update({
        where: { id },
        data: {
          ...updateAgentDto,
          permissions: JSON.parse(updateAgentDto.permissions.toString()),
          views: JSON.parse(updateAgentDto.views.toString()),
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
