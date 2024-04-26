import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreatePersonalStatusDto {
  @IsString({ message: 'Name must be a text' })
  @IsNotEmpty({ message: 'Name must not be empty' })
  @MinLength(3, { message: 'Name must contain at least 3 characters' })
  @ApiProperty()
  name: string;
}
