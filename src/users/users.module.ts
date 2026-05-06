import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleEntity } from './role.entity';
import { UserRole } from './user-role.entity';
import { User } from './user.entity';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, RoleEntity, UserRole])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
