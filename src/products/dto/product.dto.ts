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
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProductDto {
  @IsString({ message: 'Name must be a text' })
  @IsNotEmpty({ message: 'Name must not be empty' })
  @MinLength(3, { message: 'Name must contain at least 3 characters' })
  @ApiProperty()
  name: string;

  @IsNumber({}, { message: 'Purcharse Price must be a number' })
  @IsPositive({ message: 'Purcharse Price must be positive' })
  @ApiProperty()
  purchasePrice: number;

  @ApiProperty({ required: false, nullable: true })
  photo?: string | null;
}
