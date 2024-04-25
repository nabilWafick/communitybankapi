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

export class ModificationDto {
  @IsNumber({}, { message: 'Agent ID must be a number' })
  @IsPositive({ message: 'Agent ID must be positive' })
  @ApiProperty()
  agentId: number;

  @IsString({ message: 'Modification must be a text' })
  @IsNotEmpty({ message: 'Modification must not be empty' })
  @ApiProperty()
  modification: string;
}
