import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsPositive,
  NotEquals,
} from 'class-validator';

export class CreateStockConstrainedOutputDto {
  @IsArray({ message: 'Products Ids must be an array' })
  @IsInt({ each: true, message: 'Products Ids must contain only integer' })
  @ArrayMinSize(1, { message: 'Products Ids must contain a least 1 ID' })
  @ApiProperty()
  productsIds: number[];

  @IsArray({ message: 'Products Numbers must be an array' })
  @IsInt({ each: true, message: 'Products Numbers must contain only integer' })
  @ArrayMinSize(1, {
    message: 'Products Numbers must contain a least 1 number',
  })
  @ApiProperty()
  productsOutputQuantities: number[];

  @IsInt({ message: 'Card ID must be an integer' })
  @NotEquals(0, { message: 'Card ID must not be equal to 0' })
  @IsPositive({ message: 'Card ID must be positive' })
  @ApiProperty()
  cardId: number;

  /* @IsInt({ message: 'Agent ID must be an integer' })
  @NotEquals(0, { message: 'Agent ID must not be equal to 0' })
  @IsPositive({ message: 'Agent ID must be positive' })
  @ApiProperty()*/
  agentId: number;

  @IsDateString({}, { message: 'Satisfaction Date must be a ISO8601String' })
  @IsNotEmpty({ message: 'Satisfaction Date must not be empty' })
  @ApiProperty()
  satisfiedAt: string;
}
