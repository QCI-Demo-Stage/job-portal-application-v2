import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { SampleModule } from './sample/sample.module';
import { RoleEntity } from './users/role.entity';
import { UserRole } from './users/user-role.entity';
import { User } from './users/user.entity';

const entities = [User, RoleEntity, UserRole];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isTest = config.get<string>('NODE_ENV') === 'test';
        if (isTest) {
          return {
            type: 'sqlite' as const,
            database: ':memory:',
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
    }),
    AuthModule,
    SampleModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
