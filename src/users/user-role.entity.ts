import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { RoleEntity } from './role.entity';
import { User } from './user.entity';

@Entity({ name: 'user_role' })
export class UserRole {
  @PrimaryColumn({ name: 'user_id', type: 'int' })
  userId!: number;

  @PrimaryColumn({ name: 'role_id', type: 'int' })
  roleId!: number;

  @ManyToOne(() => User, (user) => user.userRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => RoleEntity, { eager: false })
  @JoinColumn({ name: 'role_id' })
  role!: RoleEntity;
}
