import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, NotEquals } from 'class-validator';

export class CreateStockNormalOutputDto {
  @IsInt({ message: 'Card ID must be an integer' })
  @NotEquals(0, { message: 'Card ID must not be equal to 0' })
  @IsPositive({ message: 'Card ID must be positive' })
  @ApiProperty({ nullable: true })
  cardId: number | null;

  @IsInt({ message: 'Agent ID must be an integer' })
  @NotEquals(0, { message: 'Agent ID must not be equal to 0' })
  @IsPositive({ message: 'Agent ID must be positive' })
  @ApiProperty()
  agentId: number;
}
