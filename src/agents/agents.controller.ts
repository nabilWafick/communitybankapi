import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { AgentsService } from './agents.service';
import { AgentDto } from './dto/agent.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AgentEntity } from './entities/agents.entity';

@Controller('agents')
@ApiTags('Agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post()
  @ApiCreatedResponse({ type: AgentEntity })
  create(@Body() agentDto: AgentDto) {
    return this.agentsService.create({ agent: agentDto });
  }

  @Get()
  @ApiOkResponse({ type: AgentEntity, isArray: true })
  findAll() {
    return this.agentsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: AgentEntity })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.agentsService.findOne({ id: +id });
  }

  @Patch(':id')
  @ApiOkResponse({ type: AgentEntity })
  update(@Param('id', ParseIntPipe) id: number, @Body() agentDto: AgentDto) {
    return this.agentsService.update({ id: +id, agent: agentDto });
  }

  @Delete(':id')
  @ApiOkResponse({ type: AgentEntity })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.agentsService.remove({ id: +id });
  }
}
