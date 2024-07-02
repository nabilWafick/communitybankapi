import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, NotEquals } from 'class-validator';

export class CreateTransferDto {
  @IsInt({ message: 'Issuing Card ID must be an integer' })
  @NotEquals(0, { message: 'Issuing Card ID must not be equal to 0' })
  @IsPositive({ message: 'Issuing Card ID must be positive' })
  @ApiProperty()
  issuingCardId: number;

  @IsInt({ message: 'Receiving Card ID must be an integer' })
  @NotEquals(0, { message: 'Receiving Card ID must not be equal to 0' })
  @IsPositive({ message: 'Receiving Card ID must be positive' })
  @ApiProperty()
  receivingCardId: number;

  /* @IsInt({ message: 'Agent ID must be an integer' })
  @NotEquals(0, { message: 'Agent ID must not be equal to 0' })
  @IsPositive({ message: 'Agent ID must be positive' })*/
  @ApiProperty()
  agentId: number;
}
