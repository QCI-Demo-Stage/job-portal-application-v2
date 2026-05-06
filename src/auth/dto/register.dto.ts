import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from '../../common/enums/role.enum';

export const REGISTERABLE_ROLES: Role[] = [Role.Seeker, Role.Employer];

export class RegisterDto {
  @ApiProperty({
    example: 'jane@example.com',
    description: 'Unique email address used for login.',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'Str0ng_Password!',
    description: 'Plain-text password (minimum 8 characters).',
    minLength: 8,
  })
  @IsNotEmpty()
  @MinLength(8)
  password!: string;

  @ApiProperty({
    enum: Role,
    enumName: 'Role',
    description:
      'Requested role at signup. Only `job_seeker` and `employer` are allowed here (`admin` is not self-registerable).',
  })
  @IsIn(REGISTERABLE_ROLES)
  role!: Role;

  @ApiProperty({
    example: 'Jane',
    description: 'Given name (optional; defaults if omitted).',
    required: false,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Family name (optional; defaults if omitted).',
    required: false,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;
}
