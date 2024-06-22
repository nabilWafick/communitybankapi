import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, NotEquals } from 'class-validator';

export class CheckCardProductsAvailabilityDto {
  @IsInt({ message: 'Card ID must be an integer' })
  @NotEquals(0, { message: 'Card ID must not be equal to 0' })
  @IsPositive({ message: 'Card ID must be positive' })
  @ApiProperty()
  cardId: number;
}
