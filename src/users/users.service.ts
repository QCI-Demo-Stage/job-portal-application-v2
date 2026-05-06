import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../common/enums/role.enum';
import { RoleEntity } from './role.entity';
import { UserRole } from './user-role.entity';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(RoleEntity)
    private readonly roles: Repository<RoleEntity>,
    @InjectRepository(UserRole)
    private readonly userRoles: Repository<UserRole>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.users.findOne({
      where: { email: email.toLowerCase() },
      relations: ['userRoles', 'userRoles.role'],
    });
  }

  findByIdWithRoles(id: number): Promise<User | null> {
    return this.users.findOne({
      where: { id },
      relations: ['userRoles', 'userRoles.role'],
    });
  }

  resolvePrimaryRole(user: User): Role | null {
    if (!user.userRoles?.length) {
      return null;
    }
    const sorted = [...user.userRoles].sort((a, b) => b.roleId - a.roleId);
    const name = sorted[0].role?.name;
    return this.parseRoleName(name);
  }

  private parseRoleName(name: string | undefined): Role | null {
    if (!name) {
      return null;
    }
    const values = Object.values(Role) as string[];
    return values.includes(name) ? (name as Role) : null;
  }

  async createWithRole(
    email: string,
    passwordHash: string,
    role: Role,
    firstName: string,
    lastName: string,
  ): Promise<User> {
    const roleRow = await this.roles.findOne({ where: { name: role } });
    if (!roleRow) {
      throw new InternalServerErrorException(
        `Role "${role}" is not present in the database`,
      );
    }

    const user = this.users.create({
      email: email.toLowerCase(),
      passwordHash,
      firstName,
      lastName,
      phone: null,
      isActive: true,
    });
    await this.users.save(user);

    const link = this.userRoles.create({
      userId: user.id,
      roleId: roleRow.id,
    });
    await this.userRoles.save(link);

    return (
      (await this.findByIdWithRoles(user.id)) ??
      user
    );
  }
}
