import { PartialType } from '@nestjs/swagger';
import { CreateStockRetrocessionDto } from './create-stock-retrocession.dto';

export class UpdateStockRetrocessionDto extends PartialType(
  CreateStockRetrocessionDto,
) {}
