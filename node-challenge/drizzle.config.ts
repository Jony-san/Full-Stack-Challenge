import { defineConfig } from "drizzle-kit";
//Configuracion del ORM
export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,//Base de datos a la que se conectara
  },
});