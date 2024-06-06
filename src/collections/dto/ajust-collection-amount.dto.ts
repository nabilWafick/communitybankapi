import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';
import { IsNumber, NotEquals, IsPositive } from 'class-validator';

export class AjustCollectionAmount {
  @IsNumber({}, { message: 'Ajustement Amount must be a number' })
  @NotEquals(0, { message: 'Ajustement Amount must not be equal to 0' })
  // @IsPositive({ message: 'Ajustement Amount must be positive' })
  @ApiProperty()
  amount: Decimal;
}
