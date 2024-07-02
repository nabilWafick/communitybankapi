import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsPositive, NotEquals } from 'class-validator';

export class GetProductForecastDto {
  @IsOptional()
  @IsInt({ message: 'Product ID must be an integer' })
  @NotEquals(0, { message: 'Product ID must not be equal to 0' })
  @IsPositive({ message: 'Product ID must be positive' })
  @ApiProperty()
  productId?: number;

  @IsOptional()
  @IsInt({ message: 'Customer ID must be an integer' })
  @NotEquals(0, { message: 'Customer ID must not be equal to 0' })
  @IsPositive({ message: 'Customer ID must be positive' })
  @ApiProperty()
  customerId?: number;

  @IsOptional()
  @IsInt({ message: 'Collector ID must be an integer' })
  @NotEquals(0, { message: 'Collector ID must not be equal to 0' })
  @IsPositive({ message: 'Collector ID must be positive' })
  @ApiProperty()
  collectorId?: number;

  @IsOptional()
  @IsInt({ message: 'Card ID must be an integer' })
  @NotEquals(0, { message: 'Card ID must not be equal to 0' })
  @IsPositive({ message: 'Card ID must be positive' })
  @ApiProperty()
  cardId?: number;

  @IsOptional()
  @IsInt({ message: 'Type ID must be an integer' })
  @NotEquals(0, { message: 'Type ID must not be equal to 0' })
  @IsPositive({ message: 'Type ID must be positive' })
  @ApiProperty()
  typeId?: number;

  @IsOptional()
  @IsInt({ message: 'Total Settlement Number must be an integer' })
  @NotEquals(0, { message: 'Total Settlement Number must not be equal to 0' })
  @IsPositive({ message: 'Total Settlement Number must be positive' })
  @ApiProperty()
  totalSettlementNumber?: number;

  @IsInt({ message: 'Offset must be an integer' })
  @ApiProperty()
  offset: number;

  @IsInt({ message: 'Limit must be an integer' })
  @NotEquals(0, { message: 'Limit must not be equal to 0' })
  @IsPositive({ message: 'Limit must be positive' })
  @ApiProperty()
  limit: number;
}
