import { PartialType } from '@nestjs/swagger';
import { CreateStockConstrainedRetrocessionDto } from './create-stock-constrained-retrocession.dto';

export class UpdateStockConstrainedRetrocessionDto extends PartialType(
  CreateStockConstrainedRetrocessionDto,
) {}
