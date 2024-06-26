// permissions.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorator/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermissions) {
      return true;
    }
    const agentPermissions =
      context.switchToHttp().getRequest().user.permissions || [];

    const hasPermissions =
      agentPermissions.includes('admin') ||
      requiredPermissions.every((permission) =>
        agentPermissions.includes(permission),
      );

    if (!hasPermissions) {
      throw new HttpException(
        {
          message: {
            en: 'Access denied',
            fr: 'Accès refusé',
          },
          error: { en: 'Forbidden', fr: 'Interdit' },
          statusCode: HttpStatus.FORBIDDEN,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }
}
