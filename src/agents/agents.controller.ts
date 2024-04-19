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
  async create(@Body() agent: AgentDto): Promise<AgentEntity> {
    try {
      return await this.agentsService.create({ agent });
    } catch (error) {
      if (error.message === 'Unique constraint violation') {
        throw new HttpException(
          'Entity with this data already exists',
          HttpStatus.CONFLICT,
        );
      }
      /* if (error.message === 'Foreign key constraint violation') {
        throw new HttpException(
          'Invalid foreign key reference',
          HttpStatus.BAD_REQUEST,
        );
      }*/
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

  @Get()
  @ApiOkResponse({ type: AgentEntity, isArray: true })
  async findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('cursor') cursor?: Prisma.AgentWhereUniqueInput,
    @Query('where') where?: Prisma.AgentWhereInput,
    @Query('orderBy') orderBy?: Prisma.AgentOrderByWithRelationInput,
  ): Promise<AgentEntity[]> {
    try {
      const params = { skip, take, cursor, where, orderBy };

      return await this.agentsService.findAll(params);
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
          `Entity with ID ${id} not found`,
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
          `Entity with ID ${id} not found`,
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
          `Entity with ID ${id} not found`,
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
