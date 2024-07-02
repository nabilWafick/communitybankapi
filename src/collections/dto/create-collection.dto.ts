import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  NotEquals,
} from 'class-validator';

export class CreateCollectionDto {
  @IsInt({ message: 'Collector ID must be an integer' })
  @NotEquals(0, { message: 'Collector ID must not be equal to 0' })
  @IsPositive({ message: 'Collector ID must be positive' })
  @ApiProperty()
  collectorId: number;

  @IsNumber({}, { message: 'Amount must be a number' })
  @NotEquals(0, { message: 'Amount ID must not be equal to 0' })
  @IsPositive({ message: 'Amount must be positive' })
  @ApiProperty()
  amount: Decimal;

  /*@IsInt({ message: 'Agent ID must be an integer' })
  @NotEquals(0, { message: 'Agent ID must not be equal to 0' })
  @IsPositive({ message: 'Agent ID must be positive' })*/
  @ApiProperty()
  agentId: number;

  @IsDateString({}, { message: 'Collection Date must be a ISO8601String' })
  @IsNotEmpty({ message: 'Collection Date must not be empty' })
  @ApiProperty()
  collectedAt: string;
}
