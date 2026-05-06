import "reflect-metadata";
import * as dotenv from "dotenv";
import { DataSource } from "typeorm";

dotenv.config();

export default new DataSource({
  type: "postgres",
  host: process.env.DB_HOST ?? "localhost",
  port: parseInt(process.env.DB_PORT ?? "5432", 10),
  username: process.env.DB_USERNAME ?? "jobportal",
  password: process.env.DB_PASSWORD ?? "jobportal",
  database: process.env.DB_NAME ?? "jobportal",
  migrations: ["src/migrations/*.ts"],
  synchronize: false,
  logging: process.env.DB_LOGGING === "true",
});
