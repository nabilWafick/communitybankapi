import {
  IsEmail,
  IsJSON,
  IsNotEmpty,
  IsNumber,
  IsPhoneNumber,
  IsPositive,
  IsString,
  Matches,
  MinLength,
  NotEquals,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @IsString({ message: 'Name must be a text' })
  @IsNotEmpty({ message: 'Name must not be empty' })
  @MinLength(3, { message: 'Name must contain at least 3 characters' })
  @ApiProperty()
  name: string;

  @IsNumber(
    {
      allowInfinity: false,
      allowNaN: false,
      maxDecimalPlaces: 2,
    },
    { message: 'Purchase Price must be a number' },
  )
  @NotEquals(0, { message: 'Purchase Price must not be equal to 0' })
  @IsPositive({ message: 'Purcharse Price must be positive' })
  @ApiProperty()
  purchasePrice: number;

  @ApiProperty({ required: false, nullable: true })
  photo?: string | null;
}
