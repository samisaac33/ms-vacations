import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres, { type Options as PostgresOptions } from "postgres";
import * as schema from "./schema";

export type Db = PostgresJsDatabase<typeof schema>;

let conn: ReturnType<typeof postgres> | null = null;
let db: Db | null = null;

function postgresClientOptions(url: string): PostgresOptions<Record<string, never>> {
  const isServerless = Boolean(process.env.VERCEL);
  const usesSupabase =
    url.includes("supabase.co") || url.includes("pooler.supabase.com");
  const usesTransactionPooler = url.includes(":6543") || url.includes("pgbouncer=true");

  return {
    max: isServerless ? 1 : 5,
    // Supabase pooler (especialmente transaction mode) no soporta prepared statements.
    prepare: usesSupabase || usesTransactionPooler ? false : true,
    idle_timeout: 20,
    connect_timeout: 10,
  };
}

export function getDb(): Db {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL no está configurada");
  }
  if (!db) {
    conn = postgres(url, postgresClientOptions(url));
    db = drizzle(conn, { schema });
  }
  return db;
}

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export { schema };
