import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateCardDto } from './create-card.dto';
import { IsDateString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateCardDto extends PartialType(CreateCardDto) {
  @IsOptional()
  @IsDateString({}, { message: 'Repayement Date must be a ISO8601String' })
  @IsNotEmpty({ message: 'Repayement Date must not be empty' })
  @ApiProperty()
  repaidAt?: string | null;
}
