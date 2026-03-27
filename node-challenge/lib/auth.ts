// /lib/auth.ts
import { betterAuth } from "better-auth";


export const auth = betterAuth({
  secret: process.env.AUTH_SECRET!,
  baseURL: process.env.DATABASE_Auth!,

  emailAndPassword: {
    enabled: true,
  },

  // 👇 importante para el challenge
  plugins: [
    // organization plugin (multi-tenant)
  ],
});