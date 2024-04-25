import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';
import {
  ArrayMinSize,
  IsArray,
  IsInstance,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';

export class TypeDto {
  @IsString({ message: 'Name must be a text' })
  @IsNotEmpty({ message: 'Name must not be empty' })
  @MinLength(3, { message: 'Name must contain at least 3 characters' })
  @ApiProperty()
  name: string;

  @IsNumber({}, { message: 'Stake must be a number' })
  @IsPositive({ message: 'Stake must be positive' })
  @ApiProperty()
  stake: Decimal;

  @IsArray({ message: 'Products Ids must be an array' })
  @IsInt({ each: true, message: 'Products Ids must contain only integer' })
  @ArrayMinSize(1, { message: 'Produsts Ids must contain a least 1 ID' })
  @ApiProperty()
  productsIds: number[];

  @IsArray({ message: 'Products Numbers must be an array' })
  @IsInt({ each: true, message: 'Products Numbers must contain only integer' })
  @ArrayMinSize(1, {
    message: 'Produsts Numbers must contain a least 1 number',
  })
  @ApiProperty()
  productsNumbers: number[];
}
