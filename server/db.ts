import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "@shared/schema";

const sqlite = createClient({
  url: "file:blockstacker.db"
});

export const db = drizzle(sqlite, { schema });
