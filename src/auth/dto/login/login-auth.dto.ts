import { PartialType } from '@nestjs/mapped-types';
import { CreateAuthDto } from '../register/register-auth.dto';

export class UpdateAuthDto extends PartialType(CreateAuthDto) {}
