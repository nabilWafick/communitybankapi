import { PartialType } from '@nestjs/swagger';
import { CreateStockManualInputDto } from './create-stock-manual-input.dto';

export class UpdateStockManualInputDto extends PartialType(
  CreateStockManualInputDto,
) {}
