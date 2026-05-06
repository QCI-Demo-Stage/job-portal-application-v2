import { ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { Role } from '../src/common/enums/role.enum';
import { RoleEntity } from '../src/users/role.entity';
import { UsersService } from '../src/users/users.service';

describe('Auth & RBAC (e2e)', () => {
  let app: import('@nestjs/common').INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    dataSource = moduleFixture.get(DataSource);
    const roleRepo = dataSource.getRepository(RoleEntity);
    await roleRepo.save([
      { name: Role.Seeker, description: 'Job seeker account' },
      { name: Role.Employer, description: 'Employer account' },
      { name: Role.Admin, description: 'Platform administrator' },
    ]);

    const usersService = moduleFixture.get(UsersService);
    const passwordHash = await bcrypt.hash('AdminPass123', 12);
    await usersService.createWithRole(
      'admin-e2e@example.com',
      passwordHash,
      Role.Admin,
      'Admin',
      'User',
    );
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('registers a seeker and returns tokens', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'seeker-e2e@example.com',
        password: 'SeekerPass123',
        role: Role.Seeker,
      })
      .expect(201);

    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.user.role).toBe(Role.Seeker);
  });

  it('rejects duplicate registration', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'seeker-e2e@example.com',
        password: 'SeekerPass123',
        role: Role.Seeker,
      })
      .expect(409);
  });

  it('logs in with valid credentials', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'seeker-e2e@example.com',
        password: 'SeekerPass123',
      })
      .expect(200);

    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  it('returns 401 for invalid login', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'seeker-e2e@example.com',
        password: 'WrongPassword123',
      })
      .expect(401);
  });

  it('refreshes tokens', async () => {
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'seeker-e2e@example.com',
        password: 'SeekerPass123',
      })
      .expect(200);

    const res = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: login.body.refreshToken })
      .expect(200);

    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  it('returns 401 for invalid refresh token', async () => {
    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: 'not-a-real-token' })
      .expect(401);
  });

  it('allows seeker to access seeker-only route', async () => {
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'seeker-e2e@example.com',
        password: 'SeekerPass123',
      })
      .expect(200);

    const res = await request(app.getHttpServer())
      .get('/sample/seeker-only')
      .set('Authorization', `Bearer ${login.body.accessToken}`)
      .expect(200);

    expect(res.body.scope).toBe('seeker');
  });

  it('returns 403 when seeker hits admin-only route', async () => {
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'seeker-e2e@example.com',
        password: 'SeekerPass123',
      })
      .expect(200);

    await request(app.getHttpServer())
      .get('/sample/admin-only')
      .set('Authorization', `Bearer ${login.body.accessToken}`)
      .expect(403);
  });

  it('allows admin to access admin-only route', async () => {
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin-e2e@example.com',
        password: 'AdminPass123',
      })
      .expect(200);

    const res = await request(app.getHttpServer())
      .get('/sample/admin-only')
      .set('Authorization', `Bearer ${login.body.accessToken}`)
      .expect(200);

    expect(res.body.scope).toBe('admin');
  });

  it('returns 401 for protected route without token', async () => {
    await request(app.getHttpServer()).get('/sample/seeker-only').expect(401);
  });

  it('returns 401 for protected route with malformed token', async () => {
    await request(app.getHttpServer())
      .get('/sample/seeker-only')
      .set('Authorization', 'Bearer not-a-jwt')
      .expect(401);
  });
});
