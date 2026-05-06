import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRoleTable1746547201001 implements MigrationInterface {
  name = "CreateRoleTable1746547201001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS role (
        id SERIAL PRIMARY KEY,
        name VARCHAR(64) NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT uq_role_name UNIQUE (name)
      );
    `);
    await queryRunner.query(`
      INSERT INTO role (name, description) VALUES
        ('job_seeker', 'Job seeker account'),
        ('employer', 'Employer account'),
        ('admin', 'Platform administrator')
      ON CONFLICT (name) DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS role CASCADE;`);
  }
}
