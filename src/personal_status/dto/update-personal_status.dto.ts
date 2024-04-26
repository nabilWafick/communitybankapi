import { PartialType } from '@nestjs/swagger';
import { CreatePersonalStatusDto } from './create-personal_status.dto';

export class UpdatePersonalStatusDto extends PartialType(
  CreatePersonalStatusDto,
) {}
