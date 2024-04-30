import { PartialType } from '@nestjs/swagger';
import { CreateStockNormalOutputDto } from './create-stock-normal-output.dto';

export class UpdateStockNormalDto extends PartialType(
  CreateStockNormalOutputDto,
) {}
