import { PartialType } from '@nestjs/swagger';
import { CreateStockManualOutputDto } from './create-stock-manual-output.dto';

export class UpdateStockManualOutputDto extends PartialType(
  CreateStockManualOutputDto,
) {}
