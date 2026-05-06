import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function buildSwaggerDocument(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Job Portal API')
    .setDescription(
      'REST API for Job Portal V2: JWT access and refresh tokens, role-based access control, and job postings with pagination and filters.',
    )
    .setVersion('1.0.0')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .setContact(
      'Job Portal Team',
      'https://github.com/QCI-Demo-Stage/job-portal-application-v2',
      'support@example.com',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'Paste the access token from login/register (`accessToken` field). Use header `Authorization: Bearer <token>`.',
      },
      'JWT-auth',
    )
    .addServer('/', 'Current server (same origin)')
    .addTag('auth', 'Registration, login, and token refresh')
    .addTag('jobs', 'Public job listings and employer job management')
    .addTag('sample', 'Role-protected sample endpoints for JWT/RBAC checks')
    .build();

  return SwaggerModule.createDocument(app, config);
}
