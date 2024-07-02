import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsPositive,
  NotEquals,
} from 'class-validator';

export class CreateStockNormalOutputDto {
  @IsInt({ message: 'Card ID must be an integer' })
  @NotEquals(0, { message: 'Card ID must not be equal to 0' })
  @IsPositive({ message: 'Card ID must be positive' })
  @ApiProperty()
  cardId: number;

  /* @IsInt({ message: 'Agent ID must be an integer' })
  @NotEquals(0, { message: 'Agent ID must not be equal to 0' })
  @IsPositive({ message: 'Agent ID must be positive' })*/
  @ApiProperty()
  agentId: number;

  @IsDateString({}, { message: 'Satisfaction Date must be a ISO8601String' })
  @IsNotEmpty({ message: 'Satisfaction Date must not be empty' })
  @ApiProperty()
  satisfiedAt: string;
}
