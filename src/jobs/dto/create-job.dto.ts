import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateJobDto {
  @ApiProperty({
    example: 'Senior Backend Engineer',
    description: 'Job title shown in listings.',
    maxLength: 255,
    minLength: 5,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(255)
  title!: string;

  @ApiProperty({
    example:
      'We use NestJS and PostgreSQL. You will design REST APIs, collaborate with frontend engineers, and participate in code reviews.',
    description: 'Full job description and requirements.',
    minLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  description!: string;

  @ApiProperty({
    example: 'Berlin, DE (hybrid)',
    description: 'Primary location or remote policy.',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  location!: string;

  @ApiProperty({
    example: 95000,
    description:
      'Optional gross salary when minimum and maximum are equal (stored internally as a single amount).',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  salary?: number;

  @ApiProperty({
    example: 'full_time',
    description:
      'Employment type code matching `employment_type.code` (for example `full_time`, `part_time`).',
    required: false,
    maxLength: 32,
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  category?: string;
}
