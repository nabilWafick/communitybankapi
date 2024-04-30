import { PartialType } from '@nestjs/swagger';
import { CreateStockNormalRetrocessionDto } from './create-stock-normal-retrocession.dto';

export class UpdateStockNormalRetrocessionDto extends PartialType(
  CreateStockNormalRetrocessionDto,
) {}
