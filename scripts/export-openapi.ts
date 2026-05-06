import 'reflect-metadata';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { buildSwaggerDocument } from '../src/swagger/swagger-document';

async function exportOpenApi(): Promise<void> {
  process.env.NODE_ENV ??= 'test';
  process.env.JWT_SECRET ??= 'openapi-export-jwt-secret';
  process.env.JWT_REFRESH_SECRET ??= 'openapi-export-refresh-secret';

  const app = await NestFactory.create(AppModule, { logger: false });
  const document = buildSwaggerDocument(app);
  writeFileSync(
    join(__dirname, '..', 'openapi.json'),
    `${JSON.stringify(document, null, 2)}\n`,
    'utf8',
  );
  await app.close();
}

exportOpenApi().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
