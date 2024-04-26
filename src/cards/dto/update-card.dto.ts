import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateCardDto } from './create-card.dto';

export class UpdateCardDto extends PartialType(CreateCardDto) {
  @ApiProperty({ required: false, nullable: true })
  repaidAt?: string | null;

  @ApiProperty({ required: false, nullable: true })
  satisfiedAt?: string | null;

  @ApiProperty({ required: false, nullable: true })
  transferedAt?: string | null;
}
