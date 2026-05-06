import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { EmploymentType } from './entities/employment-type.entity';
import { JobStatus } from './entities/job-status.entity';
import { Job } from './entities/job.entity';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Job, EmploymentType, JobStatus]),
    AuthModule,
  ],
  controllers: [JobsController],
  providers: [JobsService],
})
export class JobsModule {}
