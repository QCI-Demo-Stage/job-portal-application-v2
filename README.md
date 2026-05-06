# Job Portal Application V2 — Backend API

NestJS service with TypeORM, PostgreSQL migrations, JWT access and refresh tokens, role-based access control, and job posting APIs.

## API documentation (Swagger)

After **`npm run start:dev`**, open interactive docs at **`http://localhost:3000/api-docs`**.

Developer guide (authentication flow, `curl` examples, Spectral lint): **[docs/api/swagger-usage.md](./docs/api/swagger-usage.md)**.

## Scripts

| Script | Purpose |
| ------ | ------- |
| `npm run start:dev` | Run API with file watch |
| `npm run build` | Compile TypeScript |
| `npm run test` | Unit tests |
| `npm run openapi:export` | Write [`openapi.json`](./openapi.json) from Nest Swagger metadata |
| `npm run spectral:lint` | Lint `openapi.json` with Spectral (requires global `spectral` CLI) |

Database migrations: see **`npm run migration:run`** and related scripts in [`package.json`](./package.json).

---

_Repository tooling note: this file started from the Tymeline project stub and was expanded for the Job Portal backend._
