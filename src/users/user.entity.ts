import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserRole } from './user-role.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash!: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName!: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName!: string;

  @Column({ type: 'varchar', length: 32, nullable: true })
  phone!: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @OneToMany(() => UserRole, (ur) => ur.user, { cascade: true })
  userRoles!: UserRole[];
}
