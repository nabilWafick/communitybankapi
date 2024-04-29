import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateTransferDto } from './create-transfer.dto';

export class UpdateTransferDto extends PartialType(CreateTransferDto) {
  @ApiProperty({ required: false, nullable: true })
  validatedAt?: string | null;

  @ApiProperty({ required: false, nullable: true })
  rejectedAt?: string | null;
}
