import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterAuthDto, LoginAuthDto } from './dto';
@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(registerAuthDto: RegisterAuthDto) {}

  async login(loginAuthDto: LoginAuthDto) {}
}
