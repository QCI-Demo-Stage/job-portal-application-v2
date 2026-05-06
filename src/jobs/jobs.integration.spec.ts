import { ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../app.module';
import { Role } from '../common/enums/role.enum';
import { RoleEntity } from '../users/role.entity';
import { EmploymentType } from './entities/employment-type.entity';
import { JobStatus } from './entities/job-status.entity';
import { Job } from './entities/job.entity';
import { JobListingResponse } from './jobs.service';

import '../../test/setup-env-e2e';

describe('Jobs HTTP (integration)', () => {
  jest.setTimeout(60000);
  let moduleFixture: TestingModule;
  let app: import('@nestjs/common').INestApplication;
  let employerToken: string;
  let seekerToken: string;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();

    const dataSource = moduleFixture.get(DataSource);
    const roleRepo = dataSource.getRepository(RoleEntity);
    await roleRepo.save([
      { name: Role.Seeker, description: 'Job seeker account' },
      { name: Role.Employer, description: 'Employer account' },
      { name: Role.Admin, description: 'Platform administrator' },
    ]);

    const jobStatusRepo = dataSource.getRepository(JobStatus);
    await jobStatusRepo.save([
      { code: 'draft', label: 'Draft' },
      { code: 'published', label: 'Published' },
      { code: 'closed', label: 'Closed' },
      { code: 'archived', label: 'Archived' },
    ]);

    const employmentRepo = dataSource.getRepository(EmploymentType);
    await employmentRepo.save([
      { code: 'full_time', label: 'Full-time' },
      { code: 'part_time', label: 'Part-time' },
      { code: 'contract', label: 'Contract' },
    ]);

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'jobs-int-employer@example.com',
        password: 'EmployerPass123',
        role: Role.Employer,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'jobs-int-seeker@example.com',
        password: 'SeekerPass123',
        role: Role.Seeker,
      })
      .expect(201);

    const employerLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'jobs-int-employer@example.com',
        password: 'EmployerPass123',
      })
      .expect(200);

    const seekerLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'jobs-int-seeker@example.com',
        password: 'SeekerPass123',
      })
      .expect(200);

    employerToken = employerLogin.body.accessToken as string;
    seekerToken = seekerLogin.body.accessToken as string;
  });

  beforeEach(async () => {
    const dataSource = moduleFixture.get(DataSource);
    await dataSource.getRepository(Job).clear();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    if (moduleFixture) {
      await moduleFixture.close();
    }
  });

  const validBody = {
    title: 'Backend Engineer',
    description: 'Build scalable APIs with NestJS and TypeORM orm.',
    location: 'New York',
    category: 'full_time',
    salary: 150000,
  };

  it('GET /jobs allows unauthenticated read', async () => {
    await request(app.getHttpServer()).get('/jobs').expect(200);
  });

  it('POST /jobs returns 401 without bearer token', async () => {
    await request(app.getHttpServer())
      .post('/jobs')
      .send(validBody)
      .expect(401);
  });

  it('POST /jobs returns 403 for Seeker role', async () => {
    await request(app.getHttpServer())
      .post('/jobs')
      .set('Authorization', `Bearer ${seekerToken}`)
      .send(validBody)
      .expect(403);
  });

  it('POST /jobs creates job for Employer and GET returns it', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/jobs')
      .set('Authorization', `Bearer ${employerToken}`)
      .send(validBody)
      .expect(201);

    const created = createRes.body as JobListingResponse;

    expect(created).toMatchObject({
      title: validBody.title,
      category: validBody.category,
    });
    expect(typeof created.employerId).toBe('number');

    const listRes = await request(app.getHttpServer())
      .get('/jobs')
      .query({
        category: 'full_time',
        location: 'york',
        page: 1,
        limit: 10,
      })
      .expect(200);

    const listBody = listRes.body as {
      data: JobListingResponse[];
      meta: { total: number };
    };

    expect(listBody.meta.total).toBeGreaterThanOrEqual(1);
    expect(listBody.data[0]).toMatchObject({
      title: validBody.title,
      category: validBody.category,
    });

    await request(app.getHttpServer()).get(`/jobs/${created.id}`).expect(200);
  });

  it('POST /jobs returns 400 on validation failure', async () => {
    await request(app.getHttpServer())
      .post('/jobs')
      .set('Authorization', `Bearer ${employerToken}`)
      .send({
        title: 'bad',
        description: 'short',
        location: 'X',
      })
      .expect(400);
  });

  it('PATCH and DELETE enforce employer ownership', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/jobs')
      .set('Authorization', `Bearer ${employerToken}`)
      .send(validBody)
      .expect(201);

    const created = createRes.body as JobListingResponse;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'other-employer-jobs@example.com',
        password: 'EmployerPass123',
        role: Role.Employer,
      })
      .expect(201);

    const otherLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'other-employer-jobs@example.com',
        password: 'EmployerPass123',
      })
      .expect(200);

    const otherToken = otherLogin.body.accessToken as string;

    await request(app.getHttpServer())
      .patch(`/jobs/${created.id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ title: 'Another title here ok long' })
      .expect(403);

    await request(app.getHttpServer())
      .patch(`/jobs/${created.id}`)
      .set('Authorization', `Bearer ${employerToken}`)
      .send({ title: 'Updated job title string ok' })
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/jobs/${created.id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(403);

    await request(app.getHttpServer())
      .delete(`/jobs/${created.id}`)
      .set('Authorization', `Bearer ${employerToken}`)
      .expect(204);

    await request(app.getHttpServer()).get(`/jobs/${created.id}`).expect(404);
  });
});
