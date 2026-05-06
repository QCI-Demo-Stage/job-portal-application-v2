import { Controller, Get } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('sample')
export class SampleController {
  @Get('admin-only')
  @Roles(Role.Admin)
  adminOnly() {
    return { scope: 'admin' };
  }

  @Get('seeker-only')
  @Roles(Role.Seeker)
  seekerOnly() {
    return { scope: 'seeker' };
  }
}
