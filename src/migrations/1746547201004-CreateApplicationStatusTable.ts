import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateApplicationStatusTable1746547201004 implements MigrationInterface {
  name = "CreateApplicationStatusTable1746547201004";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS application_status (
        id SERIAL PRIMARY KEY,
        code VARCHAR(32) NOT NULL,
        label VARCHAR(128) NOT NULL,
        CONSTRAINT uq_application_status_code UNIQUE (code)
      );
    `);
    await queryRunner.query(`
      INSERT INTO application_status (code, label) VALUES
        ('pending', 'Pending'),
        ('reviewed', 'Reviewed'),
        ('shortlisted', 'Shortlisted'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('withdrawn', 'Withdrawn')
      ON CONFLICT (code) DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS application_status CASCADE;`);
  }
}
