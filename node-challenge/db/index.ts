import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

//Conexion con base de datos
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool)