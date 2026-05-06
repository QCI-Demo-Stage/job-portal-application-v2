import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EmploymentType } from './employment-type.entity';
import { JobStatus } from './job-status.entity';

@Entity({ name: 'job' })
export class Job {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'employer_id', type: 'integer' })
  employerId!: number;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'varchar', length: 255 })
  location!: string;

  @Column({
    name: 'salary_min',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  salaryMin!: string | null;

  @Column({
    name: 'salary_max',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  salaryMax!: string | null;

  @ManyToOne(() => EmploymentType, { nullable: true })
  @JoinColumn({ name: 'employment_type_id' })
  employmentType!: EmploymentType | null;

  @ManyToOne(() => JobStatus)
  @JoinColumn({ name: 'job_status_id' })
  jobStatus!: JobStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ name: 'published_at', type: 'datetime', nullable: true })
  publishedAt!: Date | null;
}
