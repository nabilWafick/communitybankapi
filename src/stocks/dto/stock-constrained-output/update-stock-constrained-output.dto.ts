import { PartialType } from '@nestjs/swagger';
import { CreateStockConstrainedOutputDto } from './create-stock-constrained-output.dto';

export class UpdateStockConstrainedOutputDto extends PartialType(
  CreateStockConstrainedOutputDto,
) {}
