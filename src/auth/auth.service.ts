import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterAuthDto, LoginAuthDto, LogoutAuthDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { Prisma } from '@prisma/client';
import { UserEntity } from './entities/auth.entity';
import { SocketGateway } from 'src/common/socket/socket.gateway';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,

    private readonly socketGateway: SocketGateway,
  ) {}

  async register({
    registerAuthDto,
  }: {
    registerAuthDto: RegisterAuthDto;
  }): Promise<UserEntity> {
    try {
      // Check if the agent exists
      const agent = await this.prisma.agent.findUnique({
        where: { email: registerAuthDto.email },
      });
      if (!agent) {
        throw new Error('Agent not found');
      }

      // Check if the user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { agentId: agent.id },
      });
      if (existingUser) {
        throw new Error('User already exists');
      }

      // Hash the password
      const hashedPassword = await argon2.hash(registerAuthDto.password);

      // Create the user
      const user = await this.prisma.user.create({
        data: {
          agentId: agent.id,
          password: hashedPassword,
          accessToken: '',
          securityQuestions: registerAuthDto.securityQuestions,
        },
        include: {
          agent: true,
        },
      });

      // emit registration event
      this.socketGateway.emitProductEvent({
        event: 'auth-registration',
        data: { ...user, password: '' },
      });

      return { ...user, password: '' };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        throw new Error('Invalid query or request');
      }
      if (error instanceof Prisma.PrismaClientRustPanicError) {
        throw new Error('Internal Prisma client error');
      }
      if (error instanceof Prisma.PrismaClientInitializationError) {
        throw new Error('Prisma client initialization error');
      }
      throw error;
    }
  }

  async login({
    loginAuthDto,
  }: {
    loginAuthDto: LoginAuthDto;
  }): Promise<UserEntity> {
    try {
      // Check if the agent exists
      const agent = await this.prisma.agent.findUnique({
        where: { email: loginAuthDto.email },
      });
      if (!agent) {
        throw new Error('Agent not found');
      }

      // Find the user
      const user = await this.prisma.user.findUnique({
        where: { agentId: agent.id },
      });
      if (!user) {
        throw new Error('Account not found');
      }

      // Check the password
      const isPasswordValid = await argon2.verify(
        user.password,
        loginAuthDto.password,
      );
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      // check if user is not already online
      if (user.onlineStatus === 'online') {
        throw new Error('User online');
      }

      const agentPermissions = JSON.parse(JSON.stringify(agent.permissions));

      const grantedPermissions = Object.keys(agentPermissions).filter(
        (key) => agentPermissions[key] === true,
      );

      const playload = {
        userId: user.id,
        agentId: user.agentId,
        permissions: grantedPermissions,
      };

      // Generate JWT token
      const token = this.jwtService.sign(playload, {
        expiresIn: process.env.JWT_EXPIRATION,
      });

      // Update the user's last login time and access token
      const newUser = await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          accessToken: token,
          onlineStatus: 'online',
          lastLoginAt: new Date(),
          updatedAt: new Date(),
        },
        include: {
          agent: true,
        },
      });

      // emit login event
      this.socketGateway.emitProductEvent({
        event: 'auth-login',
        data: { ...user, password: '' },
      });

      return { ...newUser, password: '' };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        throw new Error('Invalid query or request');
      }
      if (error instanceof Prisma.PrismaClientRustPanicError) {
        throw new Error('Internal Prisma client error');
      }
      if (error instanceof Prisma.PrismaClientInitializationError) {
        throw new Error('Prisma client initialization error');
      }
      throw error;
    }
  }

  async logout({
    logoutAuthDto,
  }: {
    logoutAuthDto: LogoutAuthDto;
  }): Promise<UserEntity> {
    try {
      // Check if the agent exists
      const agent = await this.prisma.agent.findUnique({
        where: { email: logoutAuthDto.email },
      });
      if (!agent) {
        throw new Error('Agent not found');
      }

      // Find the user
      const user = await this.prisma.user.findUnique({
        where: { agentId: agent.id },
      });

      if (!user) {
        throw new Error('Account not found');
      }

      if (user.onlineStatus === 'offline') {
        throw new Error('User offline');
      }

      // Update the user's last logout time and reset access token
      const newUser = await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          accessToken: '',
          onlineStatus: 'offline',
          lastLogoutAt: new Date(),
          updatedAt: new Date(),
        },
        include: {
          agent: true,
        },
      });

      // emit logout event
      this.socketGateway.emitProductEvent({
        event: 'auth-logout',
        data: { ...user, password: '' },
      });

      return { ...newUser, password: '' };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        throw new Error('Invalid query or request');
      }
      if (error instanceof Prisma.PrismaClientRustPanicError) {
        throw new Error('Internal Prisma client error');
      }
      if (error instanceof Prisma.PrismaClientInitializationError) {
        throw new Error('Prisma client initialization error');
      }
      throw error;
    }
  }
}
