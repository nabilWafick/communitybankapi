import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAuthDto, LoginAuthDto } from './dto';
import { Prisma } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerAuthDto: RegisterAuthDto) {
    console.log({ registerAuthDto });
    return registerAuthDto;
  }

  @Post('login')
  login(@Body() loginAuthDto: LoginAuthDto) {
    console.log({ loginAuthDto });
    return loginAuthDto;
  }

  @Get('')
  get(@Body() get: Prisma.UserCreateInput) {}
}
