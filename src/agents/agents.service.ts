import { Injectable } from '@nestjs/common';
import { AgentDto } from './dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AgentEntity } from './entities/agents.entity';

@Injectable()
export class AgentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create({ agent }: { agent: AgentDto }): Promise<AgentEntity | null> {
    return;
  }

  async findAll(): Promise<AgentEntity[]> {
    return this.prisma.agent.findMany();
  }

  async findOne({ id }: { id: number }): Promise<AgentEntity | null> {
    return;
  }

  async update({
    id,
    agent,
  }: {
    id: number;
    agent: AgentDto;
  }): Promise<AgentEntity | null> {
    return;
  }

  async remove({ id }: { id: number }): Promise<AgentEntity | null> {
    return;
  }
}
