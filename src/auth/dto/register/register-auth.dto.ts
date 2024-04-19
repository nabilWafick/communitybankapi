import {
  IsEmail,
  IsJSON,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterAuthDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsJSON()
  @IsNotEmpty()
  @MinLength(3)
  securityQuestions: JSON;
}
