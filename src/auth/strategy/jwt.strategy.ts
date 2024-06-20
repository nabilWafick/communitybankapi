// jwt.strategy.ts
import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    try {
      // Check if the token is valid
      if (
        !payload ||
        !payload.userId ||
        !payload.agentId ||
        !payload.permissions
      ) {
        throw new HttpException(
          {
            message: {
              en: 'Invalid authentication token',
              fr: "Jeton d'authentification invalide",
            },
            error: { en: 'Unauthorized', fr: 'Non Autorisé' },
            statusCode: HttpStatus.UNAUTHORIZED,
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      // Check if the token is expired
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        throw new HttpException(
          {
            message: {
              en: 'Expired authentication token',
              fr: "Jeton d'authentification expiré",
            },
            error: { en: 'Unauthorized', fr: 'Non Autorisé' },
            statusCode: HttpStatus.UNAUTHORIZED,
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      // Check if the user and agent exist in the database
      const user = await this.prisma.user.findUnique({
        where: { id: payload.userId },
      });
      const agent = await this.prisma.agent.findUnique({
        where: { id: payload.agentId },
      });

      if (!user || !agent) {
        throw new HttpException(
          {
            message: {
              en: 'Invalid authentication token',
              fr: "Jeton d'authentification invalide",
            },
            error: { en: 'Unauthorized', fr: 'Non Autorisé' },
            statusCode: HttpStatus.UNAUTHORIZED,
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      return {
        userId: user.id,
        agentId: agent.id,
        permissions: payload.permissions,
      };
    } catch (error) {
      throw new HttpException(
        {
          message: {
            en: 'Invalid authentication token',
            fr: "Jeton d'authentification invalide",
          },
          error: { en: 'Unauthorized', fr: 'Non Autorisé' },
          statusCode: HttpStatus.UNAUTHORIZED,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
