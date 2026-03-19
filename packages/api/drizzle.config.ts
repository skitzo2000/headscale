import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER ?? "forms",
    password: process.env.DB_PASSWORD ?? "forms_dev",
    database: process.env.DB_NAME ?? "forms_pwa",
  },
});
