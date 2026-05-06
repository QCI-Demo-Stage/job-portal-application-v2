import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateJobDto } from './dto/create-job.dto';
import { FindJobsQueryDto } from './dto/find-jobs-query.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobsService } from './jobs.service';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @HttpCode(201)
  @Roles(Role.Employer)
  create(
    @Body() createJobDto: CreateJobDto,
    @CurrentUser('userId') employerId: string,
  ) {
    return this.jobsService.create(employerId, createJobDto);
  }

  @Public()
  @Get()
  findAll(@Query() query: FindJobsQueryDto) {
    return this.jobsService.findAll(query);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.jobsService.findPublished(id);
  }

  @Patch(':id')
  @Roles(Role.Employer)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateJobDto: UpdateJobDto,
    @CurrentUser('userId') employerId: string,
  ) {
    return this.jobsService.update(id, employerId, updateJobDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles(Role.Employer)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId') employerId: string,
  ) {
    return this.jobsService.remove(id, employerId);
  }
}
