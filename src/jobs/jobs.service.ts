import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateJobDto } from './dto/create-job.dto';
import { FindJobsQueryDto } from './dto/find-jobs-query.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { EmploymentType } from './entities/employment-type.entity';
import { Job } from './entities/job.entity';
import { JobStatus } from './entities/job-status.entity';

export type JobListingResponse = {
  id: number;
  title: string;
  description: string;
  location: string;
  salary: number | null;
  /** Maps to `employment_type.code` in the database. */
  category: string | null;
  employerId: number;
  createdAt: Date;
  updatedAt: Date;
};

export type PaginatedJobsResult = {
  data: JobListingResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobs: Repository<Job>,
    @InjectRepository(EmploymentType)
    private readonly employmentTypes: Repository<EmploymentType>,
    @InjectRepository(JobStatus)
    private readonly jobStatuses: Repository<JobStatus>,
  ) {}

  private serialize(job: Job): JobListingResponse {
    const hasSalary =
      job.salaryMin != null &&
      job.salaryMax != null &&
      job.salaryMin === job.salaryMax;
    return {
      id: job.id,
      title: job.title,
      description: job.description,
      location: job.location,
      salary:
        hasSalary && job.salaryMin != null
          ? parseFloat(job.salaryMin)
          : null,
      category: job.employmentType?.code ?? null,
      employerId: job.employerId,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    };
  }

  private async resolveEmploymentType(
    code: string | undefined,
  ): Promise<EmploymentType | null> {
    if (!code) {
      return null;
    }
    const row = await this.employmentTypes.findOne({ where: { code } });
    if (!row) {
      throw new BadRequestException(`Unknown category code: ${code}`);
    }
    return row;
  }

  private async getPublishedStatus(): Promise<JobStatus> {
    const status = await this.jobStatuses.findOne({
      where: { code: 'published' },
    });
    if (!status) {
      throw new InternalServerErrorException(
        'Published job status is not configured',
      );
    }
    return status;
  }

  async create(
    employerIdStr: string,
    dto: CreateJobDto,
  ): Promise<JobListingResponse> {
    const employerId = Number(employerIdStr);
    if (!Number.isFinite(employerId)) {
      throw new BadRequestException('Invalid employer id');
    }

    const employmentType = await this.resolveEmploymentType(dto.category);
    const published = await this.getPublishedStatus();
    const salaryStr =
      dto.salary !== undefined && dto.salary !== null
        ? dto.salary.toFixed(2)
        : null;

    const entity = this.jobs.create({
      employerId,
      title: dto.title,
      description: dto.description,
      location: dto.location,
      salaryMin: salaryStr,
      salaryMax: salaryStr,
      employmentType,
      jobStatus: published,
      publishedAt: new Date(),
    });

    const saved = await this.jobs.save(entity);
    const withRelations = await this.jobs.findOne({
      where: { id: saved.id },
      relations: ['employmentType', 'jobStatus'],
    });
    if (!withRelations) {
      throw new NotFoundException('Job could not be loaded after save');
    }
    return this.serialize(withRelations);
  }

  async findAll(query: FindJobsQueryDto): Promise<PaginatedJobsResult> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const qb = this.jobs
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.employmentType', 'employmentType')
      .innerJoinAndSelect('job.jobStatus', 'jobStatus')
      .where('jobStatus.code = :published', { published: 'published' })
      .orderBy('job.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (query.category) {
      qb.andWhere('employmentType.code = :category', {
        category: query.category,
      });
    }
    if (query.location) {
      qb.andWhere('LOWER(job.location) LIKE LOWER(:location)', {
        location: `%${query.location}%`,
      });
    }

    const [rows, total] = await qb.getManyAndCount();
    const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

    return {
      data: rows.map((j) => this.serialize(j)),
      meta: { total, page, limit, totalPages },
    };
  }

  async findPublished(id: number): Promise<JobListingResponse> {
    const job = await this.jobs.findOne({
      where: { id },
      relations: ['employmentType', 'jobStatus'],
    });
    if (!job || job.jobStatus.code !== 'published') {
      throw new NotFoundException(`Job with id ${id} not found`);
    }
    return this.serialize(job);
  }

  private async findEmployerListingOrFail(
    id: number,
    employerId: number,
  ): Promise<Job> {
    const job = await this.jobs.findOne({
      where: { id },
      relations: ['employmentType', 'jobStatus'],
    });
    if (!job) {
      throw new NotFoundException(`Job with id ${id} not found`);
    }
    if (job.employerId !== employerId) {
      throw new ForbiddenException(
        'You can only modify your own job listings',
      );
    }
    return job;
  }

  async update(
    id: number,
    employerIdStr: string,
    dto: UpdateJobDto,
  ): Promise<JobListingResponse> {
    const employerId = Number(employerIdStr);
    if (!Number.isFinite(employerId)) {
      throw new BadRequestException('Invalid employer id');
    }

    const existing = await this.findEmployerListingOrFail(id, employerId);

    if (dto.title !== undefined) {
      existing.title = dto.title;
    }
    if (dto.description !== undefined) {
      existing.description = dto.description;
    }
    if (dto.location !== undefined) {
      existing.location = dto.location;
    }

    if (dto.category !== undefined) {
      existing.employmentType = await this.resolveEmploymentType(dto.category);
    }

    if (dto.salary !== undefined) {
      const salaryStr =
        dto.salary === null ? null : dto.salary.toFixed(2);
      existing.salaryMin = salaryStr;
      existing.salaryMax = salaryStr;
    }

    const saved = await this.jobs.save(existing);
    const reloaded = await this.jobs.findOne({
      where: { id: saved.id },
      relations: ['employmentType', 'jobStatus'],
    });
    if (!reloaded) {
      throw new NotFoundException('Job could not be loaded after update');
    }
    return this.serialize(reloaded);
  }

  async remove(id: number, employerIdStr: string): Promise<void> {
    const employerId = Number(employerIdStr);
    if (!Number.isFinite(employerId)) {
      throw new BadRequestException('Invalid employer id');
    }
    const existing = await this.findEmployerListingOrFail(id, employerId);
    await this.jobs.remove(existing);
  }
}
