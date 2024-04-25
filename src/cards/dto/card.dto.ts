import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmpty,
  IsInt,
  IsNumber,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';
import { IsNull } from 'typeorm';

export class CardDto {
  @IsString({ message: 'Label must be text' })
  @IsEmpty({ message: 'Label must not be empty' })
  @MinLength(5, { message: 'Label must contain a least 5 characters' })
  @ApiProperty()
  label: string;

  @IsInt({ message: 'Type ID must be an integer' })
  @IsPositive({ message: 'Type ID must be positive' })
  @ApiProperty()
  typeId: number;

  @IsInt({ message: 'Customer ID must be an integer' })
  @IsPositive({ message: 'Customer ID must be positive' })
  @ApiProperty()
  customerId: number;

  @IsInt({ message: 'Type number must be an integer' })
  @IsPositive({ message: 'Type number must be positive' })
  @ApiProperty()
  typesNumber: number;

  @ApiProperty({ required: false, nullable: true })
  repaidAt?: string | null;

  @ApiProperty({ required: false, nullable: true })
  satisfiedAt?: string | null;

  @ApiProperty({ required: false, nullable: true })
  transferedAt?: string | null;
}
