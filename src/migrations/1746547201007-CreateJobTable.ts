import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateJobTable1746547201007 implements MigrationInterface {
  name = "CreateJobTable1746547201007";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS job (
        id SERIAL PRIMARY KEY,
        employer_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        location VARCHAR(255) NOT NULL,
        salary_min NUMERIC(12, 2),
        salary_max NUMERIC(12, 2),
        employment_type_id INTEGER,
        job_status_id INTEGER NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        published_at TIMESTAMPTZ,
        CONSTRAINT fk_job_employer FOREIGN KEY (employer_id) REFERENCES users (id) ON DELETE CASCADE,
        CONSTRAINT fk_job_employment_type FOREIGN KEY (employment_type_id) REFERENCES employment_type (id) ON DELETE SET NULL,
        CONSTRAINT fk_job_status FOREIGN KEY (job_status_id) REFERENCES job_status (id) ON DELETE RESTRICT
      );
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_job_title ON job (title);
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_job_location ON job (location);
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_job_employer_id ON job (employer_id);
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_job_job_status_id ON job (job_status_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS job CASCADE;`);
  }
}
