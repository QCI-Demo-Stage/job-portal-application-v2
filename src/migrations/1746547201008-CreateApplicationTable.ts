import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateApplicationTable1746547201008 implements MigrationInterface {
  name = "CreateApplicationTable1746547201008";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS application (
        id SERIAL PRIMARY KEY,
        job_id INTEGER NOT NULL,
        applicant_id INTEGER NOT NULL,
        application_status_id INTEGER NOT NULL,
        cover_letter TEXT,
        resume_url VARCHAR(512),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT uq_application_job_applicant UNIQUE (job_id, applicant_id),
        CONSTRAINT fk_application_job FOREIGN KEY (job_id) REFERENCES job (id) ON DELETE CASCADE,
        CONSTRAINT fk_application_applicant FOREIGN KEY (applicant_id) REFERENCES users (id) ON DELETE CASCADE,
        CONSTRAINT fk_application_status FOREIGN KEY (application_status_id) REFERENCES application_status (id) ON DELETE RESTRICT
      );
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_application_created_at ON application (created_at);
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_application_job_id ON application (job_id);
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_application_applicant_id ON application (applicant_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS application CASCADE;`);
  }
}
