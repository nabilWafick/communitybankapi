import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateAgentDto } from './create-agent.dto';
import { IsDateString } from 'class-validator';

export class UpdateAgentDto extends PartialType(CreateAgentDto) {
  @IsDateString({}, { message: 'Creation Date must be an Iso8601String' })
  @ApiProperty()
  createdAt: string;
}
