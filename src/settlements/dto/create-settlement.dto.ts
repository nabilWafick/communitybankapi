import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsPositive } from 'class-validator';

export class CreateSettlementDto {
  @IsInt({ message: 'Number must be an integer' })
  @IsPositive({ message: 'Number must be positive' })
  @ApiProperty()
  number: number;

  @IsInt({ message: 'Agent ID must be an integer' })
  @IsPositive({ message: 'Agent ID must be positive' })
  @ApiProperty()
  agentId: number;

  @IsInt({ message: 'Card ID must be an integer' })
  @IsPositive({ message: 'Card ID must be positive' })
  @ApiProperty()
  cardId: number;

  @IsInt({ message: 'Collection ID must be an integer' })
  @IsPositive({ message: 'Collection ID must be positive' })
  @ApiProperty()
  collectionId: number;

  @IsBoolean({ message: 'Is Validated must be a boolean' })
  @ApiProperty({ default: true })
  isValidated: boolean;
}
