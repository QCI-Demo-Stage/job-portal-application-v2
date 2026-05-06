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
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(255)
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  description!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  location!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  salary?: number;

  /** Stored as `employment_type.code` (for example `full_time`). */
  @IsOptional()
  @IsString()
  @MaxLength(32)
  category?: string;
}
