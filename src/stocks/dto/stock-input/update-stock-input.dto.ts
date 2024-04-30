import { PartialType } from '@nestjs/swagger';
import { CreateStockInputDto } from './create-stock-input.dto';

export class UpdateStockInputDto extends PartialType(CreateStockInputDto) {}
