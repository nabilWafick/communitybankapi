import { IsEmail, IsJSON, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AgentDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  firstnames: string;

  @ApiProperty({ required: false })
  phoneNumber?: string | null;

  @ApiProperty({ required: false })
  address?: string | null;

  @ApiProperty({ required: false })
  profile?: string | null;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsJSON()
  @IsNotEmpty()
  @ApiProperty()
  permissions: JSON;

  @IsJSON()
  @IsNotEmpty()
  @ApiProperty()
  views: JSON;
}
