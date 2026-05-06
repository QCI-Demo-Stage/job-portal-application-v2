import '../../test/setup-env-e2e';

import { ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import request from 'supertest';
import type { Server } from 'http';
import { AppModule } from '../app.module';
import { Role } from '../common/enums/role.enum';
import { EmploymentType } from './entities/employment-type.entity';
import { JobStatus } from './entities/job-status.entity';
import { RoleEntity } from '../users/role.entity';

describe('Jobs HTTP (integration)', () => {
  let app: import('@nestjs/common').INestApplication;
  let moduleRef: TestingModule;
  let employerAccessToken: string;
  let seekerAccessToken: string;
  let otherEmployerAccessToken: string;

  const server = (): Server => app.getHttpServer() as Server;

  const validBody = {
    title: 'Backend Developer',
    description: 'Design APIs and services for our platform.',
    location: 'Remote EU',
    salary: 88000,
    category: 'full_time',
  };

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();

    const ds = moduleRef.get(DataSource);
    await ds.getRepository(RoleEntity).save([
      { name: Role.Seeker, description: 'Job seeker account' },
      { name: Role.Employer, description: 'Employer account' },
      { name: Role.Admin, description: 'Platform administrator' },
    ]);

    await ds.getRepository(EmploymentType).save([
      { code: 'full_time', label: 'Full-time' },
      { code: 'part_time', label: 'Part-time' },
      { code: 'contract', label: 'Contract' },
      { code: 'internship', label: 'Internship' },
      { code: 'temporary', label: 'Temporary' },
    ]);

    await ds.getRepository(JobStatus).save([
      { code: 'draft', label: 'Draft' },
      { code: 'published', label: 'Published' },
      { code: 'closed', label: 'Closed' },
      { code: 'archived', label: 'Archived' },
    ]);

    const suffix = Date.now();
    const employerReg = await request(server())
      .post('/auth/register')
      .send({
        email: `employer-${suffix}@integration.test`,
        password: 'password12',
        role: Role.Employer,
      })
      .expect(201);
    employerAccessToken = employerReg.body.accessToken as string;

    const seekerReg = await request(server())
      .post('/auth/register')
      .send({
        email: `seeker-${suffix}@integration.test`,
        password: 'password12',
        role: Role.Seeker,
      })
      .expect(201);
    seekerAccessToken = seekerReg.body.accessToken as string;

    const otherEmployerReg = await request(server())
      .post('/auth/register')
      .send({
        email: `employer2-${suffix}@integration.test`,
        password: 'password12',
        role: Role.Employer,
      })
      .expect(201);
    otherEmployerAccessToken = otherEmployerReg.body.accessToken as string;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('GET /jobs is readable without authentication', async () => {
    await request(server()).get('/jobs').expect(200);
  });

  it('POST /jobs returns 401 without token', async () => {
    await request(server()).post('/jobs').send(validBody).expect(401);
  });

  it('POST /jobs returns 403 for Seeker role', async () => {
    await request(server())
      .post('/jobs')
      .set('Authorization', `Bearer ${seekerAccessToken}`)
      .send(validBody)
      .expect(403);
  });

  it('POST /jobs returns 400 when validation fails', async () => {
    await request(server())
      .post('/jobs')
      .set('Authorization', `Bearer ${employerAccessToken}`)
      .send({
        title: 'ab',
        description: 'short',
        location: '',
      })
      .expect(400);
  });

  it('creates, lists, reads, updates, and deletes a job for employers', async () => {
    const createRes = await request(server())
      .post('/jobs')
      .set('Authorization', `Bearer ${employerAccessToken}`)
      .send(validBody)
      .expect(201);

    expect(createRes.body).toMatchObject({
      title: validBody.title,
      description: validBody.description,
      location: validBody.location,
      category: 'full_time',
    });
    expect(typeof createRes.body.id).toBe('number');

    const listRes = await request(server())
      .get('/jobs')
      .query({
        category: 'full_time',
        location: 'remote',
        page: 1,
        limit: 10,
      })
      .expect(200);

    expect(listRes.body.meta.total).toBeGreaterThanOrEqual(1);
    expect(listRes.body.data.length).toBeGreaterThanOrEqual(1);

    const jobId = createRes.body.id as number;

    const getRes = await request(server()).get(`/jobs/${jobId}`).expect(200);
    expect(getRes.body.id).toBe(jobId);

    await request(server())
      .patch(`/jobs/${jobId}`)
      .set('Authorization', `Bearer ${otherEmployerAccessToken}`)
      .send({ title: 'Malicious Title Change Here' })
      .expect(403);

    const patchRes = await request(server())
      .patch(`/jobs/${jobId}`)
      .set('Authorization', `Bearer ${employerAccessToken}`)
      .send({ title: 'Senior Backend Developer' })
      .expect(200);
    expect(patchRes.body.title).toBe('Senior Backend Developer');

    await request(server())
      .delete(`/jobs/${jobId}`)
      .set('Authorization', `Bearer ${seekerAccessToken}`)
      .expect(403);

    await request(server())
      .delete(`/jobs/${jobId}`)
      .set('Authorization', `Bearer ${employerAccessToken}`)
      .expect(204);

    await request(server()).get(`/jobs/${jobId}`).expect(404);
  });
});
