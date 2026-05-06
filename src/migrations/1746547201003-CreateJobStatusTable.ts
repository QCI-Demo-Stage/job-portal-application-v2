import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateJobStatusTable1746547201003 implements MigrationInterface {
  name = "CreateJobStatusTable1746547201003";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS job_status (
        id SERIAL PRIMARY KEY,
        code VARCHAR(32) NOT NULL,
        label VARCHAR(128) NOT NULL,
        CONSTRAINT uq_job_status_code UNIQUE (code)
      );
    `);
    await queryRunner.query(`
      INSERT INTO job_status (code, label) VALUES
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('closed', 'Closed'),
        ('archived', 'Archived')
      ON CONFLICT (code) DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS job_status CASCADE;`);
  }
}
