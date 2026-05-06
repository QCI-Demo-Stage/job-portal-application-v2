import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { webcrypto } from 'node:crypto';
import { AppModule } from './app.module';
import { buildSwaggerDocument } from './swagger/swagger-document';

if (typeof globalThis.crypto === 'undefined') {
  Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
    writable: true,
    configurable: true,
  });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const document = buildSwaggerDocument(app);
  SwaggerModule.setup('api-docs', app, document, {
    customSiteTitle: 'Job Portal API — Swagger UI',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      showRequestDuration: true,
    },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}

void bootstrap();
