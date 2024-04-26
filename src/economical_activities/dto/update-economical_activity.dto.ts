import { PartialType } from '@nestjs/swagger';
import { CreateEconomicalActivityDto } from './create-economical_activity.dto';

export class UpdateEconomicalActivityDto extends PartialType(
  CreateEconomicalActivityDto,
) {}
