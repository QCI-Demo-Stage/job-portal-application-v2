import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEmploymentTypeTable1746547201002 implements MigrationInterface {
  name = "CreateEmploymentTypeTable1746547201002";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS employment_type (
        id SERIAL PRIMARY KEY,
        code VARCHAR(32) NOT NULL,
        label VARCHAR(128) NOT NULL,
        CONSTRAINT uq_employment_type_code UNIQUE (code)
      );
    `);
    await queryRunner.query(`
      INSERT INTO employment_type (code, label) VALUES
        ('full_time', 'Full-time'),
        ('part_time', 'Part-time'),
        ('contract', 'Contract'),
        ('internship', 'Internship'),
        ('temporary', 'Temporary')
      ON CONFLICT (code) DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS employment_type CASCADE;`);
  }
}
