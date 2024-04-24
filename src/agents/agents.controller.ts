import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { AgentsService } from './agents.service';
import { AgentDto } from './dto/agent.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AgentEntity } from './entities/agents.entity';
import { Prisma } from '@prisma/client';

@Controller('agents')
@ApiTags('Agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post()
  @ApiCreatedResponse({ type: AgentEntity })
  async create(@Body() agentDto: AgentDto): Promise<AgentEntity> {
    try {
      return await this.agentsService.create({ agentDto: agentDto });
    } catch (error) {
      if (error.message === 'Email already used') {
        throw new HttpException(
          {
            message: 'The email is owned by another agent',
            error: 'Conflict',
            statusCode: HttpStatus.CONFLICT,
          },
          HttpStatus.CONFLICT,
        );
      }

      /*if (error.message === 'Unique constraint violation') {
        throw new HttpException(
          'Agent with this data already exists',
          HttpStatus.CONFLICT,
        );
      }*/
      /* if (error.message === 'Foreign key constraint violation') {
        throw new HttpException(
          'Invalid foreign key reference',
          HttpStatus.BAD_REQUEST,
        );
      }*/
      if (error.message === 'Invalid query or request') {
        throw new HttpException(
          {
            message: 'Invalid request or data',
            error: 'Bad Request',
            statusCode: HttpStatus.BAD_REQUEST,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      if (error.message === 'Internal Prisma client error') {
        throw new HttpException(
          {
            message: 'An Error occurred on the server',
            error: 'Internal Serveur Error',
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      if (error.message === 'Prisma client initialization error') {
        throw new HttpException(
          {
            message: 'An Error occurred on the server ',
            error: 'Internal Serveur Error',
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOkResponse({ type: AgentEntity, isArray: true })
  async findAll(
    @Query('skip', ParseIntPipe) skip?: number | null,
    @Query('take', ParseIntPipe) take?: number | null,
    @Query('cursor') cursor?: Prisma.AgentWhereUniqueInput,
    @Query('where') where?: Prisma.AgentWhereInput,
    @Query('orderBy') orderBy?: Prisma.AgentOrderByWithRelationInput,
  ): Promise<AgentEntity[]> {
    try {
      return await this.agentsService.findAll({
        skip,
        take,
        cursor,
        where,
        orderBy,
      });
    } catch (error) {
      if (error.message === 'Records not found') {
        throw new HttpException('No records found', HttpStatus.NOT_FOUND);
      }
      if (error.message === 'Invalid query or request') {
        throw new HttpException(
          'Invalid request or data',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (error.message === 'Internal Prisma client error') {
        throw new HttpException(
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      if (error.message === 'Prisma client initialization error') {
        throw new HttpException(
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOkResponse({ type: AgentEntity })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<AgentEntity> {
    try {
      return await this.agentsService.findOne({ id: +id });
    } catch (error) {
      if (error.message.includes('not found')) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            message: `Agent not found`,
            details: {
              en: `Agent (ID: ${id}) is not in the database`,
              fr: `L'agent (ID: ${id}) n'existe pas dans la base de données`,
            },
          },
          HttpStatus.NOT_FOUND,
        );
      }
      if (error.message === 'Invalid query or request') {
        throw new HttpException(
          'Invalid request or data',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (error.message === 'Internal Prisma client error') {
        throw new HttpException(
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      if (error.message === 'Prisma client initialization error') {
        throw new HttpException(
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  @ApiOkResponse({ type: AgentEntity })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() agent: AgentDto,
  ): Promise<AgentEntity> {
    try {
      return await this.agentsService.update({ id: +id, agent: agent });
    } catch (error) {
      if (error.message === 'Unique constraint violation') {
        throw new HttpException(
          'Entity with this data already exists',
          HttpStatus.CONFLICT,
        );
      }

      /*if (error.message === 'Foreign key constraint violation') {
        throw new HttpException(
          'Invalid foreign key reference',
          HttpStatus.BAD_REQUEST,
        );
      }*/

      if (error.message.includes('not found')) {
        throw new HttpException(
          `Agent with ID ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      if (error.message === 'Invalid query or request') {
        throw new HttpException(
          'Invalid request or data',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (error.message === 'Internal Prisma client error') {
        throw new HttpException(
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      if (error.message === 'Prisma client initialization error') {
        throw new HttpException(
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @ApiOkResponse({ type: AgentEntity })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<AgentEntity> {
    try {
      return await this.agentsService.remove({ id: +id });
    } catch (error) {
      if (error.message.includes('not found')) {
        throw new HttpException(
          `Agent with ID ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      if (error.message === 'Invalid query or request') {
        throw new HttpException(
          'Invalid request or data',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (error.message === 'Internal Prisma client error') {
        throw new HttpException(
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      if (error.message === 'Prisma client initialization error') {
        throw new HttpException(
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
