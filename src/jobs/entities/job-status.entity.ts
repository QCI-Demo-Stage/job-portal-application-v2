import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'job_status' })
export class JobStatus {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 32, unique: true })
  code!: string;

  @Column({ type: 'varchar', length: 128 })
  label!: string;
}
