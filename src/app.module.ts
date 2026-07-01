import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { newDb } from 'pg-mem';
import { DataSource, DataSourceOptions } from 'typeorm';
import { AuthModule } from './auth/auth.module';
import { registerPgMemTypeormConnectionStubs } from './database/pg-mem-typeorm-stubs';
import { HealthModule } from './health/health.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { EmploymentType } from './jobs/entities/employment-type.entity';
import { JobStatus } from './jobs/entities/job-status.entity';
import { Job } from './jobs/entities/job.entity';
import { JobsModule } from './jobs/jobs.module';
import { SampleModule } from './sample/sample.module';
import { RoleEntity } from './users/role.entity';
import { UserRole } from './users/user-role.entity';
import { User } from './users/user.entity';

const entities = [
  User,
  RoleEntity,
  UserRole,
  Job,
  EmploymentType,
  JobStatus,
];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HealthModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isTest = config.get<string>('NODE_ENV') === 'test';
        if (isTest) {
          return {
            type: 'postgres' as const,
            database: 'jobportal_test',
            entities,
            synchronize: true,
          };
        }

        const databaseUrl = config.get<string>('DATABASE_URL');
        const synchronize = config.get<string>('TYPEORM_SYNC') === 'true';

        if (databaseUrl) {
          return {
            type: 'postgres' as const,
            url: databaseUrl,
            entities,
            synchronize,
          };
        }

        return {
          type: 'postgres' as const,
          host: config.get<string>('DB_HOST', 'localhost'),
          port: parseInt(config.get<string>('DB_PORT', '5432'), 10),
          username: config.get<string>('DB_USERNAME', 'jobportal'),
          password: config.get<string>('DB_PASSWORD', 'jobportal'),
          database: config.get<string>('DB_NAME', 'jobportal'),
          entities,
          synchronize,
        };
      },
      dataSourceFactory: async (options: DataSourceOptions) => {
        if (process.env.NODE_ENV === 'test') {
          const mem = newDb();
          registerPgMemTypeormConnectionStubs(mem);
          const dataSource: DataSource =
            mem.adapters.createTypeormDataSource(options);
          await dataSource.initialize();
          return dataSource;
        }
        const dataSource = new DataSource(options);
        return dataSource.initialize();
      },
    }),
    AuthModule,
    SampleModule,
    JobsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
