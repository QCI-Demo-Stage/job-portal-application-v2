import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class FindJobsQueryDto {
  @ApiProperty({
    example: 1,
    description: 'Page number (1-based).',
    required: false,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    example: 10,
    description: 'Page size (maximum 100).',
    required: false,
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({
    example: 'full_time',
    description: 'Filter by employment type code.',
    required: false,
    maxLength: 32,
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  category?: string;

  @ApiProperty({
    example: 'Berlin',
    description: 'Case-insensitive partial match on location.',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;
}
