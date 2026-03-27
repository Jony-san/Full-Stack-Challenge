import { betterAuth } from "better-auth";

export const auth = betterAuth({
  // configuración base
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.DATABASE_URL,

  // storage / adapter (depende de tu setup)
  database: {
    // aquí se conecta a Postgres
  },

  // providers (si usas email/password o social)
  emailAndPassword: {
    enabled: true,
  },
});