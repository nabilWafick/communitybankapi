import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  BadRequestException,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { error } from 'console';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      exceptionFactory: (errors) => {
        const result = errors.map((error) => ({
          property: error.property,
          message: error.constraints[Object.keys(error.constraints)[0]],
        }));
        return new BadRequestException({
          message: result,
          error: { en: 'Bad Request', fr: 'Requête Incorrecte' },
          statusCode: HttpStatus.BAD_REQUEST,
        });
      },
      stopAtFirstError: true,
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('Community Bank')
    .setDescription('The Community Bank API description')
    .setVersion('0.1')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(7000);
}
bootstrap();
