import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LogoutAuthDto {
  @IsEmail({}, { message: 'Email must be valid' })
  @IsNotEmpty()
  @ApiProperty()
  email: string;
}
