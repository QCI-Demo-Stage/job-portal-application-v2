import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('sample')
@ApiBearerAuth('JWT-auth')
@Controller('sample')
export class SampleController {
  @Get('admin-only')
  @Roles(Role.Admin)
  @ApiOperation({
    summary: 'Admin-only probe',
    description:
      'Returns `{ "scope": "admin" }` when the JWT carries the `admin` role.',
  })
  @ApiResponse({
    status: 200,
    description: 'Authorized admin caller.',
    schema: {
      example: { scope: 'admin' },
      properties: {
        scope: {
          type: 'string',
          example: 'admin',
          description: 'Fixed marker value for this probe endpoint.',
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Caller lacks the admin role.',
  })
  adminOnly() {
    return { scope: 'admin' };
  }

  @Get('seeker-only')
  @Roles(Role.Seeker)
  @ApiOperation({
    summary: 'Job seeker probe',
    description:
      'Returns `{ "scope": "seeker" }` when the JWT carries the `job_seeker` role.',
  })
  @ApiResponse({
    status: 200,
    description: 'Authorized job seeker caller.',
    schema: {
      example: { scope: 'seeker' },
      properties: {
        scope: {
          type: 'string',
          example: 'seeker',
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Caller lacks the job_seeker role.',
  })
  seekerOnly() {
    return { scope: 'seeker' };
  }

  @Get('employer-only')
  @Roles(Role.Employer)
  @ApiOperation({
    summary: 'Employer probe',
    description:
      'Returns `{ "scope": "employer" }` when the JWT carries the `employer` role.',
  })
  @ApiResponse({
    status: 200,
    description: 'Authorized employer caller.',
    schema: {
      example: { scope: 'employer' },
      properties: {
        scope: {
          type: 'string',
          example: 'employer',
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Caller lacks the employer role.',
  })
  employerOnly() {
    return { scope: 'employer' };
  }
}
