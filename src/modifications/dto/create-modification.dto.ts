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
  NotEquals,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateModificationDto {
  /* @IsNumber({}, { message: 'Agent ID must be a number' })
  @NotEquals(0, { message: 'Agent ID must not be equal to 0' })
  @IsPositive({ message: 'Agent ID must be positive' })
  @ApiProperty()*/
  agentId: number;

  @IsString({ message: 'Modification must be a text' })
  @IsNotEmpty({ message: 'Modification must not be empty' })
  @ApiProperty()
  modification: string;
}
