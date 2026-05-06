import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../common/enums/role.enum';

export class AuthUserResponseDto {
  @ApiProperty({
    example: 1,
    description: 'Numeric user id from the database.',
  })
  id!: number;

  @ApiProperty({
    example: 'jane@example.com',
    description: 'Email address used at registration.',
  })
  email!: string;

  @ApiProperty({
    enum: Role,
    enumName: 'Role',
    description:
      'Primary role for the user. Values match `role.name` in the database (job_seeker, employer, admin).',
  })
  role!: Role;
}

/** Response body for `POST /auth/register` and `POST /auth/login`. */
export class AuthSessionResponseDto {
  @ApiProperty({ type: AuthUserResponseDto })
  user!: AuthUserResponseDto;

  @ApiProperty({
    description:
      'Short-lived JWT access token. Send as `Authorization: Bearer <accessToken>`.',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidHlwIjoiYWNjZXNzIn0.example',
  })
  accessToken!: string;

  @ApiProperty({
    description:
      'Long-lived refresh token for `POST /auth/refresh` to obtain new tokens.',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidHlwIjoicmVmcmVzaCJ9.example',
  })
  refreshToken!: string;
}

/** Response body for `POST /auth/refresh`. */
export class AuthTokensOnlyResponseDto {
  @ApiProperty({
    description: 'New JWT access token.',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidHlwIjoiYWNjZXNzIn0.example',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'New refresh token.',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidHlwIjoicmVmcmVzaCJ9.example',
  })
  refreshToken!: string;
}
