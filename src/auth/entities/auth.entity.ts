import { ApiProperty } from '@nestjs/swagger';
import { Prisma, User } from '@prisma/client';
import { JsonValue } from '@prisma/client/runtime/library';

export class UserEntity implements User {
  @ApiProperty()
  id: number;

  @ApiProperty()
  agentId: number;

  @ApiProperty()
  password: string;

  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  securityQuestions: JsonValue;

  @ApiProperty()
  onlineStatus: string;

  @ApiProperty({ nullable: true })
  lastLoginAt: Date | null;

  @ApiProperty({ nullable: true })
  lastLogoutAt: Date | null;

  @ApiProperty({ nullable: true })
  passwordResetedAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
