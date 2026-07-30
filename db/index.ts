import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let client: postgres.Sql | undefined;

function getClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL no est\u00e1 configurada. Conecta PostgreSQL antes de guardar datos de TeamRoute.");
  }

  client ??= postgres(connectionString, { max: 5, prepare: false });
  return client;
}

export function getDb() {
  return drizzle(getClient(), { schema });
}
