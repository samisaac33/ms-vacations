import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type Db = PostgresJsDatabase<typeof schema>;

let conn: ReturnType<typeof postgres> | null = null;
let db: Db | null = null;

export function getDb(): Db {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL no está configurada");
  }
  if (!db) {
    conn = postgres(url, { max: 5 });
    db = drizzle(conn, { schema });
  }
  return db;
}

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export { schema };
