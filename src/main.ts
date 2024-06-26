import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  BadRequestException,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WsAdapter } from '@nestjs/platform-ws';

import {
  UnauthorizedExceptionFilter,
  ForbiddenExceptionFilter,
} from './auth/exceptions_filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // set global prefix for all routes
  app.setGlobalPrefix('api/v1');

  // define custom exception
  app.useGlobalFilters(
    new UnauthorizedExceptionFilter(),
    new ForbiddenExceptionFilter(),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      exceptionFactory: (errors) => {
        /* const message = errors.map((error) => ({
          property: error.property,
          message: error.constraints[Object.keys(error.constraints)[0]],
        }));*/
        const message = {
          en: errors[0].constraints[Object.keys(errors[0].constraints)[0]],
          fr: errors[0].constraints[Object.keys(errors[0].constraints)[0]],
        };
        return new BadRequestException({
          message: message,
          error: { en: 'Bad Request', fr: 'Requête Incorrecte' },
          statusCode: HttpStatus.BAD_REQUEST,
        });
      },
      stopAtFirstError: true,
    }),
  );

  app.useWebSocketAdapter(new WsAdapter(app));

  const config = new DocumentBuilder()
    .setTitle('Community Bank')
    .setDescription('The Community Bank API description')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/doc', app, document);
  await app.listen(7000);
}
bootstrap();
