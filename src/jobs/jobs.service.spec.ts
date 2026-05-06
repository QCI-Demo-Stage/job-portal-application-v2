import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateJobDto } from './dto/create-job.dto';
import { FindJobsQueryDto } from './dto/find-jobs-query.dto';
import { EmploymentType } from './entities/employment-type.entity';
import { Job } from './entities/job.entity';
import { JobStatus } from './entities/job-status.entity';
import { JobsService } from './jobs.service';

describe('JobsService', () => {
  let service: JobsService;
  let jobsRepo: jest.Mocked<Pick<Repository<Job>, keyof Repository<Job>>>;
  let employmentRepo: jest.Mocked<
    Pick<Repository<EmploymentType>, 'findOne'>
  >;
  let statusRepo: jest.Mocked<Pick<Repository<JobStatus>, 'findOne'>>;

  const publishedStatus: JobStatus = {
    id: 2,
    code: 'published',
    label: 'Published',
  };

  const fullTime: EmploymentType = {
    id: 1,
    code: 'full_time',
    label: 'Full-time',
  };

  const mockJobRow: Job = {
    id: 10,
    employerId: 1,
    title: 'Backend Developer',
    description: 'Design APIs and services for our platform.',
    location: 'Remote EU',
    salaryMin: '88000.00',
    salaryMax: '88000.00',
    employmentType: fullTime,
    jobStatus: publishedStatus,
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: new Date(),
  };

  beforeEach(async () => {
    jobsRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(),
    } as unknown as jest.Mocked<Pick<Repository<Job>, keyof Repository<Job>>>;

    employmentRepo = { findOne: jest.fn() };
    statusRepo = { findOne: jest.fn() };

    statusRepo.findOne.mockResolvedValue(publishedStatus);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        { provide: getRepositoryToken(Job), useValue: jobsRepo },
        {
          provide: getRepositoryToken(EmploymentType),
          useValue: employmentRepo,
        },
        { provide: getRepositoryToken(JobStatus), useValue: statusRepo },
      ],
    }).compile();

    service = module.get(JobsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('persists salary on both bounds and assigns employment type', async () => {
      employmentRepo.findOne.mockResolvedValue(fullTime);
      jobsRepo.create.mockReturnValue(mockJobRow);
      jobsRepo.save.mockResolvedValue(mockJobRow);
      jobsRepo.findOne.mockResolvedValue(mockJobRow);

      const dto: CreateJobDto = {
        title: 'Backend Developer',
        description: 'Design APIs and services for our platform.',
        location: 'Remote EU',
        salary: 88000,
        category: 'full_time',
      };

      await service.create('1', dto);

      expect(jobsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          employerId: 1,
          salaryMin: '88000.00',
          salaryMax: '88000.00',
          employmentType: fullTime,
          jobStatus: publishedStatus,
        }),
      );
    });

    it('throws when category code is unknown', async () => {
      employmentRepo.findOne.mockResolvedValue(null);

      await expect(
        service.create('1', {
          title: 'Backend Developer',
          description: 'Design APIs and services for our platform.',
          location: 'Remote EU',
          category: 'unknown_code',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('returns serialized rows with pagination meta', async () => {
      const mockQb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockJobRow], 1]),
      };
      jobsRepo.createQueryBuilder.mockReturnValue(mockQb as never);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        category: 'full_time',
        location: 'remote',
      } as FindJobsQueryDto);

      expect(mockQb.skip).toHaveBeenCalledWith(0);
      expect(mockQb.take).toHaveBeenCalledWith(10);
      expect(result.data[0]).toMatchObject({
        id: 10,
        salary: 88000,
        category: 'full_time',
      });
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findPublished', () => {
    it('throws when job is not published', async () => {
      jobsRepo.findOne.mockResolvedValue({
        ...mockJobRow,
        jobStatus: { id: 1, code: 'draft', label: 'Draft' },
      });

      await expect(service.findPublished(10)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('throws forbidden when another employer owns the listing', async () => {
      jobsRepo.findOne.mockResolvedValue({
        ...mockJobRow,
        employerId: 99,
      });

      await expect(
        service.update(10, '1', { title: 'Other title here long enough' }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });
});
