import {
  IsEmail,
  IsJSON,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { JsonValue } from '@prisma/client/runtime/library';

export class CreateAgentDto {
  @IsString({ message: 'Name must be a text' })
  @IsNotEmpty({ message: 'Name must not be empty' })
  @MinLength(3, { message: 'Name must contain at least 3 characters' })
  @ApiProperty()
  name: string;

  @IsString({ message: 'Name must be a text' })
  @IsNotEmpty({ message: 'Name must not be empty' })
  @MinLength(3, { message: 'Name must contain at least 3 characters' })
  @ApiProperty()
  firstnames: string;

  @IsPhoneNumber(null, {
    message: 'Phone number must be valid and must contain country code',
  })
  @Matches(/^(\+229|00229)[4569]\d{7}$/, {
    message:
      'Phone number must be like +229XXXXXXXX or 00229XXXXXXXX and must match r^/^(+229|00229)[4569]d{7}$/',
  })
  @ApiProperty({ required: false })
  phoneNumber?: string | null;

  @IsString({ message: 'Address must be a text' })
  @IsNotEmpty({ message: 'Address must not be empty' })
  @MinLength(3, { message: 'Address must contain at least 3 characters' })
  @ApiProperty()
  address: string;

  // @IsString({ message: 'Profile must be a text' })
  @ApiProperty({ required: false })
  profile?: string | null;

  @IsEmail({}, { message: 'Email must be valid' })
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsJSON({ message: 'Persmissions must be JSON' })
  @IsNotEmpty({ message: 'Permissions must not be empty' })
  @ApiProperty()
  permissions: JsonValue;

  @IsJSON({ message: 'Views must be JSON' })
  @IsNotEmpty({ message: 'Views must not be empty' })
  @ApiProperty()
  views: JsonValue;
}
