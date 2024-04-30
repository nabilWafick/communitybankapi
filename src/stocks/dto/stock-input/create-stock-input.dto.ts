import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, NotEquals } from 'class-validator';

export class CreateStockInputDto {
  @IsInt({ message: 'Product ID must be an integer' })
  @NotEquals(0, { message: 'Product ID must not be equal to 0' })
  @IsPositive({ message: 'Product ID must be positive' })
  @ApiProperty()
  productId: number;

  @IsInt({ message: 'Input Quantity must be an integer' })
  @NotEquals(0, { message: 'Input Quantity must not be equal to 0' })
  @IsPositive({ message: 'Input Quantity must be positive' })
  @ApiProperty({ nullable: true })
  inputQuantity: number | null;

  @IsInt({ message: 'Agent ID must be an integer' })
  @NotEquals(0, { message: 'Agent ID must not be equal to 0' })
  @IsPositive({ message: 'Agent ID must be positive' })
  @ApiProperty()
  agentId: number;
}
