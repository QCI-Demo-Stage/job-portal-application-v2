import { webcrypto } from 'node:crypto';

if (typeof globalThis.crypto === 'undefined') {
  Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
    writable: true,
    configurable: true,
  });
}

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET =
  process.env.JWT_SECRET ??
  'test-jwt-access-secret-minimum-32-characters-long';
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ??
  'test-jwt-refresh-secret-minimum-32-characters-long';
process.env.JWT_ACCESS_EXPIRES_IN =
  process.env.JWT_ACCESS_EXPIRES_IN ?? '15m';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '15m';
process.env.JWT_REFRESH_EXPIRES_IN =
  process.env.JWT_REFRESH_EXPIRES_IN ?? '7d';
