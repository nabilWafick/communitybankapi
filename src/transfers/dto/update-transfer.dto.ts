import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateTransferDto } from './create-transfer.dto';
import { IsDateString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateTransferDto extends PartialType(CreateTransferDto) {
  @IsOptional()
  @IsDateString({}, { message: 'Validation Date must be a ISO8601String' })
  @IsNotEmpty({ message: 'Validation Date must not be empty' })
  @ApiProperty({ required: false, nullable: true })
  validatedAt?: string | null;

  @IsDateString({}, { message: 'Discardation Date must be a ISO8601String' })
  @IsNotEmpty({ message: 'Discardation Date must not be empty' })
  @ApiProperty({ required: false, nullable: true })
  rejectedAt?: string | null;
}
