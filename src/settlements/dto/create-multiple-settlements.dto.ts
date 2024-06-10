import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsObject } from 'class-validator';
import { CreateCardDto } from 'src/cards/dto';
import { CreateSettlementDto } from './create-settlement.dto';

export class CreateMultipleSettlementsDto {
  @IsArray({ message: 'Cards should be an array of object' })
  @IsObject({ each: true, message: 'Cards must contains only objects' })
  @ArrayMinSize(1, {
    message: 'Settlements must contain a least 1 settlement',
  })
  @ApiProperty()
  settlements: CreateSettlementDto[];
}
