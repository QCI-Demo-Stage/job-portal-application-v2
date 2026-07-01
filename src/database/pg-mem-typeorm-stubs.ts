import { DataType, IMemoryDb } from 'pg-mem';

/**
 * Registers minimal built-ins TypeORM's Postgres driver expects at connect time.
 * pg-mem does not ship all catalog functions; extend here if new driver probes appear.
 */
export function registerPgMemTypeormConnectionStubs(mem: IMemoryDb): void {
  mem.public.registerFunction({
    name: 'version',
    returns: DataType.text,
    implementation: () => 'PostgreSQL 15.0 (pg-mem stub)',
  });
  mem.public.registerFunction({
    name: 'current_database',
    returns: DataType.text,
    implementation: () => 'jobportal_test',
  });
}
