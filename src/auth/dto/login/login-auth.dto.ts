import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class LoginAuthDto {
  @IsEmail({}, { message: 'Email must be valid' })
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  
  @MinLength(7,{message:"Password must contains at least 7 characters"})
  @IsString({message:"Password must be a string"})
  @IsNotEmpty()
  @ApiProperty()
  password: string;
}
