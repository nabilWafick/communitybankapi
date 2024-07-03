import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { PermissionsGuard } from './guard/permissions.guard';
import { JwtStrategy } from './strategy/jwt.strategy';
import { SocketGateway } from 'src/common/socket/socket.gateway';
import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: process.env.JWT_EXPIRATION,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PermissionsGuard, JwtStrategy, SocketGateway],
  exports: [AuthService, PermissionsGuard],
})
export class AuthModule {}
