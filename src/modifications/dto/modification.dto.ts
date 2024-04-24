import {
  IsEmail,
  IsJSON,
  IsNotEmpty,
  IsNumber,
  IsPhoneNumber,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ModificationDto {
  @IsNumber({}, { message: 'Agent ID must be a number' })
  @ApiProperty()
  agentId: number;

  @IsString({ message: 'Modification must be a text' })
  @IsNotEmpty({ message: 'Modification must not be empty' })
  @ApiProperty()
  modification: string;
}
