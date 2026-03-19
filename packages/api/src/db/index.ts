import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.js";

const { Pool } = pg;

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://forms:forms_dev@localhost:5432/forms_pwa";

const pool = new Pool({ connectionString });

export const db = drizzle(pool, { schema });
