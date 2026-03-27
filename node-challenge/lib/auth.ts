import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BASE_URL!,

  emailAndPassword: {
    enabled: true,
  },

  // 👇 aquí es donde cambia respecto a lo que tienes
  database: {
    provider: "pg",
    db, // o el pool dependiendo del adapter soportado
  },
});