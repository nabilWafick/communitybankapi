import { ApiProperty } from '@nestjs/swagger';
import { JsonValue } from '@prisma/client/runtime/library';
import {
  IsEmail,
  IsJSON,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterAuthDto {
  @IsEmail({}, { message: 'Email must be valid' })
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @MinLength(7, { message: 'Password must contains at least 7 characters' })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty()
  @ApiProperty()
  password: string;

  @IsJSON({ message: 'Security Questions must be JSON' })
  @IsNotEmpty({ message: 'Security Questions must not be empty' })
  @ApiProperty()
  securityQuestions: JsonValue;
}
