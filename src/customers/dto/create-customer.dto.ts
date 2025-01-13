import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsPhoneNumber,
  IsPositive,
  IsString,
  Matches,
  MinLength,
  NotEquals,
} from 'class-validator';
import { CreateCardDto } from 'src/cards/dto';
import { IsNull } from 'typeorm';

export class CreateCustomerDto {
  @IsString({ message: 'Name must be a text' })
  @IsNotEmpty({ message: 'Name must not be empty' })
  @MinLength(3, { message: 'Name must contain at least 3 characters' })
  @ApiProperty()
  name: string;

  @IsString({ message: 'Firstnames must be a text' })
  @IsNotEmpty({ message: 'Firstnames must not be empty' })
  @MinLength(3, { message: 'Firstnames must contain at least 3 characters' })
  @ApiProperty()
  firstnames: string;

  @Matches(/^(\+229|00229)[4569]\d{7}$/, {
    message:
      'Phone number must be like +229XXXXXXXX or 00229XXXXXXXX and must match r^/^(+229|00229)[4569]d{7}$/',
  })
  @ApiProperty()
  phoneNumber: string;

  @IsString({ message: 'Address must be a text' })
  @IsNotEmpty({ message: 'Address must not be empty' })
  @MinLength(3, { message: 'Address must contain at least 3 characters' })
  @ApiProperty()
  address: string;

  @IsOptional()
  // @IsString({ message: 'Occupation must be a text' })
  // @IsNotEmpty({ message: 'Occupation must not be empty' })
  //  @MinLength(3, { message: 'Occupation must contain at least 3 characters' })
  @ApiProperty()
  occupation?: string | null;

  @IsNumber({}, { message: 'NIC/NPI must be a number' })
  @IsNotEmpty({ message: 'NIC/NPI must not be empty' })
  //  @MinLength(10, { message: 'NIC/NPI must contain at least 10 characters' })
  @ApiProperty()
  nicNumber: number;

  @IsOptional()
  @IsInt({ message: 'Category ID must be an integer' })
  @NotEquals(0, { message: 'Category ID must not be equal to 0' })
  @IsPositive({ message: 'Category ID must be positive' })
  @ApiProperty({ required: false, nullable: true })
  categoryId?: number | null;

  @IsOptional()
  @IsInt({ message: 'Locality ID must be an integer' })
  @NotEquals(0, { message: 'Locality ID must not be equal to 0' })
  @IsPositive({ message: 'Locality ID must be positive' })
  @ApiProperty({ required: false, nullable: true })
  @ApiProperty()
  localityId?: number | null;

  @IsOptional()
  @IsInt({ message: 'Economical Activity ID must be an integer' })
  @NotEquals(0, { message: 'Economical Activity ID must not be equal to 0' })
  @IsPositive({ message: 'Economical Activity ID must be positive' })
  @ApiProperty({ required: false, nullable: true })
  @ApiProperty()
  economicalActivityId?: number | null;

  @IsOptional()
  @IsInt({ message: 'Personal Status ID must be an integer' })
  @NotEquals(0, { message: 'Personal Status ID must not be equal to 0' })
  @IsPositive({ message: 'Personal Status ID must be positive' })
  @ApiProperty({ required: false, nullable: true })
  @ApiProperty()
  personalStatusId?: number | null;

  @IsOptional()
  @IsInt({ message: 'Customer ID must be an integer' })
  @NotEquals(0, { message: 'Customer ID must not be equal to 0' })
  @IsPositive({ message: 'Customer ID must be positive' })
  @ApiProperty()
  collectorId?: number | null;

  @IsOptional()
  @IsString({ message: 'Profile must be a text (link)' })
  @ApiProperty()
  profile?: string | null;
  @IsOptional()
  @IsString({ message: 'Signature must be a text (link)' })
  @ApiProperty()
  signature?: string | null;

  @IsOptional()
  @IsArray({ message: 'Cards should be an array of object' })
  @IsObject({ each: true, message: 'Cards must contains only objects' })
  @ApiProperty()
  cards?: CreateCardDto[] | null;
}
