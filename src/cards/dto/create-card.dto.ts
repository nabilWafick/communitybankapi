import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmpty,
  IsInt,
  IsPositive,
  IsString,
  MinLength,
  NotEquals,
} from 'class-validator';

export class CreateCardDto {
  @IsString({ message: 'Label must be text' })
  @IsEmpty({ message: 'Label must not be empty' })
  @MinLength(5, { message: 'Label must contain a least 5 characters' })
  @ApiProperty()
  label: string;

  @IsInt({ message: 'Type ID must be an integer' })
  @NotEquals(0, { message: 'Type ID must not be equal to 0' })
  @IsPositive({ message: 'Type ID must be positive' })
  @ApiProperty()
  typeId: number;

  @IsInt({ message: 'Customer ID must be an integer' })
  @NotEquals(0, { message: 'Customer ID must not be equal to 0' })
  @IsPositive({ message: 'Customer ID must be positive' })
  @ApiProperty()
  customerId: number;

  @IsInt({ message: 'Type number must be an integer' })
  @NotEquals(0, { message: 'Type number must not be equal to 0' })
  @IsPositive({ message: 'Type number must be positive' })
  @ApiProperty({ default: 1 })
  typesNumber: number;
}
