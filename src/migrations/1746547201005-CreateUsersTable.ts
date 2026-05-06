import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersTable1746547201005 implements MigrationInterface {
  name = "CreateUsersTable1746547201005";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone VARCHAR(32),
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT uq_users_email UNIQUE (email)
      );
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_users_created_at ON users (created_at);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS users CASCADE;`);
  }
}
