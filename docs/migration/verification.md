# Migration verification — Job Portal V2 schema

This document records validation of the TypeORM migration suite against a **fresh PostgreSQL 16** instance.

## Environment

| Item | Value |
|------|--------|
| PostgreSQL | 16.13 (Ubuntu packages), new `jobportal` database and role |
| Connection | `localhost:5432`, database `jobportal` (see `.env.example`) |
| Command | `npm run migration:run` |
| Docker Compose | `docker-compose.yml` defines PostgreSQL 16 Alpine for local/CI use; the Docker daemon was **not available** in this sandbox, so verification used a locally initialized cluster instead. |

## Migration execution

All **8** migrations executed successfully in a single transaction batch. A second run of `npm run migration:run` reported **No migrations are pending**, confirming the suite is applied idempotently from TypeORM’s perspective (DDL uses `CREATE TABLE IF NOT EXISTS` / `CREATE INDEX IF NOT EXISTS` for extra safety).

Executed migrations (in order):

1. `CreateRoleTable1746547201001`
2. `CreateEmploymentTypeTable1746547201002`
3. `CreateJobStatusTable1746547201003`
4. `CreateApplicationStatusTable1746547201004`
5. `CreateUsersTable1746547201005`
6. `CreateUserRoleTable1746547201006`
7. `CreateJobTable1746547201007`
8. `CreateApplicationTable1746547201008`

## `information_schema.tables` (public)

Expected application tables plus TypeORM’s `migrations` ledger:

| table_schema | table_name | table_type |
|--------------|------------|------------|
| public | application | BASE TABLE |
| public | application_status | BASE TABLE |
| public | employment_type | BASE TABLE |
| public | job | BASE TABLE |
| public | job_status | BASE TABLE |
| public | migrations | BASE TABLE |
| public | role | BASE TABLE |
| public | user_role | BASE TABLE |
| public | users | BASE TABLE |

## `pg_indexes` (public)

**Required story indexes** (all present):

- `job`: `idx_job_title` on `(title)`, `idx_job_location` on `(location)`
- `application`: `idx_application_created_at` on `(created_at)`

Additional indexes created for FK and query performance: `idx_job_employer_id`, `idx_job_job_status_id`, `idx_application_job_id`, `idx_application_applicant_id`, `idx_user_role_role_id`, `idx_users_created_at`.

Unique constraints appear as unique indexes: `uq_users_email`, `uq_role_name`, `uq_employment_type_code`, `uq_job_status_code`, `uq_application_status_code`, `uq_application_job_applicant`.

## Constraints snapshot

Primary keys exist on all base tables; composite primary key on `user_role` `(user_id, role_id)`.

Foreign keys:

- `user_role` → `users`, `role` (ON DELETE CASCADE)
- `job` → `users` (employer), `employment_type`, `job_status`
- `application` → `job`, `users` (applicant), `application_status`

## Conclusion

The relational schema for **users**, **roles** (with `user_role` junction), **jobs**, **applications**, and **lookup** tables (`employment_type`, `job_status`, `application_status`) is present with the intended primary keys, foreign keys, unique constraints, and indexes. The migration suite is ready for use with `docker compose up -d` where Docker is available, followed by `npm run migration:run`.
