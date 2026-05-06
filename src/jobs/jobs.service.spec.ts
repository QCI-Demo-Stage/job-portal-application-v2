import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmploymentType } from './entities/employment-type.entity';
import { JobStatus } from './entities/job-status.entity';
import { Job } from './entities/job.entity';
import { JobsService } from './jobs.service';

describe('JobsService', () => {
  let service: JobsService;
  let jobs: jest.Mocked<
    Pick<
      Repository<Job>,
      'create' | 'save' | 'findOne' | 'createQueryBuilder' | 'remove'
    >
  >;
  let employmentTypes: jest.Mocked<Pick<Repository<EmploymentType>, 'findOne'>>;
  let jobStatuses: jest.Mocked<Pick<Repository<JobStatus>, 'findOne'>>;

  const publishedStatus = { id: 2, code: 'published', label: 'Published' } as JobStatus;
  const fullTime = { id: 1, code: 'full_time', label: 'Full-time' } as EmploymentType;

  beforeEach(async () => {
    jobs = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
      remove: jest.fn(),
    };
    employmentTypes = { findOne: jest.fn() };
    jobStatuses = {
      findOne: jest.fn().mockResolvedValue(publishedStatus),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        { provide: getRepositoryToken(Job), useValue: jobs },
        {
          provide: getRepositoryToken(EmploymentType),
          useValue: employmentTypes,
        },
        { provide: getRepositoryToken(JobStatus), useValue: jobStatuses },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('serializes a new published listing', async () => {
      const dto = {
        title: 'Senior Dev',
        description: 'Long enough description for validation rules',
        location: 'Remote',
        category: 'full_time',
        salary: 120000,
      };

      employmentTypes.findOne.mockResolvedValue(fullTime);

      const savedRow = {
        id: 7,
        employerId: 42,
        title: dto.title,
        description: dto.description,
        location: dto.location,
        salaryMin: '120000.00',
        salaryMax: '120000.00',
        employmentType: fullTime,
        jobStatus: publishedStatus,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Job;

      jobs.create.mockReturnValue(savedRow);
      jobs.save.mockResolvedValue(savedRow);
      jobs.findOne.mockResolvedValue(savedRow);

      const result = await service.create('42', dto);

      expect(result).toMatchObject({
        title: dto.title,
        category: 'full_time',
        salary: 120000,
        employerId: 42,
      });
    });

    it('rejects unknown employment type code', async () => {
      employmentTypes.findOne.mockResolvedValue(null);

      await expect(
        service.create('1', {
          title: 'Senior Dev',
          description: 'Long enough description for validation rules',
          location: 'Remote',
          category: 'unknown_code',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('returns paginated listings with meta', async () => {
      const row = {
        id: 1,
        employerId: 1,
        title: 'T',
        description: 'D'.repeat(20),
        location: 'NYC',
        salaryMin: '100.00',
        salaryMax: '100.00',
        employmentType: fullTime,
        jobStatus: publishedStatus,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Job;

      const getManyAndCount = jest.fn().mockResolvedValue([[row], 1]);
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getManyAndCount,
      };
      jobs.createQueryBuilder.mockReturnValue(qb as never);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        category: 'full_time',
        location: 'york',
      });

      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(result.data[0].category).toBe('full_time');
    });
  });

  describe('findPublished', () => {
    it('404 when job is not published', async () => {
      jobs.findOne.mockResolvedValue({
        id: 1,
        jobStatus: { code: 'draft' },
      } as Job);

      await expect(service.findPublished(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('forbids wrong employer', async () => {
      jobs.findOne.mockResolvedValue({
        id: 1,
        employerId: 10,
        jobStatus: publishedStatus,
        employmentType: fullTime,
      } as Job);

      await expect(
        service.update(1, '99', { title: 'New title here ok longer' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('removes when employer matches', async () => {
      const existing = {
        id: 1,
        employerId: 10,
        jobStatus: publishedStatus,
        employmentType: fullTime,
      } as Job;
      jobs.findOne.mockResolvedValue(existing);
      jobs.remove.mockResolvedValue(existing);

      await service.remove(1, '10');

      expect(jobs.remove).toHaveBeenCalledWith(existing);
    });
  });
});
