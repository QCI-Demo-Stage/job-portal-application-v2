import { ApiProperty } from '@nestjs/swagger';

/** Published job fields returned by listing and detail endpoints. */
export class JobListingResponseDto {
  @ApiProperty({ example: 42, description: 'Job posting id.' })
  id!: number;

  @ApiProperty({
    example: 'Senior Backend Engineer',
    description: 'Job title.',
  })
  title!: string;

  @ApiProperty({
    description: 'Full description text.',
    example:
      'We use NestJS and PostgreSQL. Minimum five years backend experience.',
  })
  description!: string;

  @ApiProperty({
    example: 'Berlin, DE (hybrid)',
    description: 'Location or remote policy.',
  })
  location!: string;

  @ApiProperty({
    description:
      'Representative salary when min/max match; otherwise null.',
    nullable: true,
    required: false,
    type: Number,
  })
  salary!: number | null;

  @ApiProperty({
    description: 'Employment type code from `employment_type.code`.',
    nullable: true,
    required: false,
    type: String,
  })
  category!: string | null;

  @ApiProperty({
    example: 7,
    description: 'Employer user id owning this posting.',
  })
  employerId!: number;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Creation time (ISO 8601).',
  })
  createdAt!: Date;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Last update time (ISO 8601).',
  })
  updatedAt!: Date;
}

export class PaginationMetaDto {
  @ApiProperty({ example: 120, description: 'Total rows matching filters.' })
  total!: number;

  @ApiProperty({ example: 1, description: 'Current page number.' })
  page!: number;

  @ApiProperty({ example: 10, description: 'Page size.' })
  limit!: number;

  @ApiProperty({ example: 12, description: 'Total pages given current limit.' })
  totalPages!: number;
}

export class PaginatedJobsResponseDto {
  @ApiProperty({ type: [JobListingResponseDto] })
  data!: JobListingResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}
