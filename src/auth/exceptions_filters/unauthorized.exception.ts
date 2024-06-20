import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(401).json({
      message: {
        en: 'Authentication failed',
        fr: "Échec de l'authentification",
      },
      error: {
        en: 'Unauthorized',
        fr: 'Non autorisé',
      },
      statusCode: 401,
    });
  }
}
