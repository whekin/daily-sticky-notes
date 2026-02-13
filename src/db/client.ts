import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";
import { env } from "@/lib/env";

type DbClient = ReturnType<typeof drizzle>;

let dbClient: DbClient | null = null;

export function getDb() {
  if (dbClient) {
    return dbClient;
  }

  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for Drizzle operations.");
  }

  const queryClient = postgres(env.DATABASE_URL, {
    prepare: false,
    max: 1,
  });

  dbClient = drizzle(queryClient, { schema });
  return dbClient;
}
