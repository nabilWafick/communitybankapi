import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  Max,
  Min,
  NotEquals,
} from 'class-validator';

export class CreateSettlementDto {
  @IsInt({ message: 'Number must be an integer' })
  @NotEquals(0, { message: 'Number must not be equal to 0' })
  @IsPositive({ message: 'Number must be positive' })
  @Min(1, { message: 'Number must be equal or greather than 1' })
  @Max(372, { message: 'Number must be equal or less than 372' })
  @ApiProperty()
  number: number;

  /* @IsInt({ message: 'Agent ID must be an integer' })
  @NotEquals(0, { message: 'Agent ID must not be equal to 0' })
  @IsPositive({ message: 'Agent ID must be positive' })
  @ApiProperty()*/
  agentId: number;

  @IsInt({ message: 'Card ID must be an integer' })
  @NotEquals(0, { message: 'Card ID must not be equal to 0' })
  @IsPositive({ message: 'Card ID must be positive' })
  @ApiProperty()
  cardId: number;

  @IsInt({ message: 'Collection ID must be an integer' })
  @NotEquals(0, { message: 'Collection ID must not be equal to 0' })
  @IsPositive({ message: 'Collection ID must be positive' })
  @ApiProperty()
  collectionId: number;

  @IsBoolean({ message: 'Is Validated must be a boolean' })
  @ApiProperty({ default: true })
  isValidated: boolean;
}
