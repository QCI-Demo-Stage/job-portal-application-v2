import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateJobDto } from './dto/create-job.dto';
import { FindJobsQueryDto } from './dto/find-jobs-query.dto';
import {
  JobListingResponseDto,
  PaginatedJobsResponseDto,
} from './dto/job-listing-response.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobsService } from './jobs.service';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.Employer)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a job posting',
    description:
      'Creates a **published** job owned by the authenticated employer (`employer` role required).',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Job created.',
    type: JobListingResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation failed or unknown employment type code.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid access token.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Authenticated user does not have the employer role.',
  })
  create(
    @Body() createJobDto: CreateJobDto,
    @CurrentUser('userId') employerId: string,
  ) {
    return this.jobsService.create(employerId, createJobDto);
  }

  @Public()
  @Get()
  @ApiOperation({
    summary: 'List published jobs',
    description:
      'Returns paginated **published** jobs with optional filters on employment type code and location substring.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Paginated job listings.',
    type: PaginatedJobsResponseDto,
  })
  findAll(@Query() query: FindJobsQueryDto) {
    return this.jobsService.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({
    summary: 'Get published job by id',
    description:
      'Loads a single published job by numeric id. Draft or unpublished jobs return `404`.',
  })
  @ApiParam({
    name: 'id',
    description: 'Numeric job id.',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Job found.',
    type: JobListingResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Job does not exist or is not published.',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.jobsService.findPublished(id);
  }

  @Patch(':id')
  @Roles(Role.Employer)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update a job posting',
    description:
      'Updates fields on a job owned by the authenticated employer. Employers may only mutate their own postings.',
  })
  @ApiParam({
    name: 'id',
    description: 'Numeric job id.',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Job updated.',
    type: JobListingResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation failed or unknown employment type code.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Job not found or not owned by this employer.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Caller is not allowed to modify this job.',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateJobDto: UpdateJobDto,
    @CurrentUser('userId') employerId: string,
  ) {
    return this.jobsService.update(id, employerId, updateJobDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.Employer)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete a job posting',
    description:
      'Deletes a job owned by the authenticated employer. Employers may only delete their own postings.',
  })
  @ApiParam({
    name: 'id',
    description: 'Numeric job id.',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Job deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Job not found or not owned by this employer.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Caller is not allowed to delete this job.',
  })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId') employerId: string,
  ) {
    return this.jobsService.remove(id, employerId);
  }
}
