import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

//Tabla contactos
export const contacts = pgTable("contacts", {
  id: uuid("id").primaryKey().defaultRandom(),//llave primaria con id unico
  tenantId: text("tenant_id").notNull(),//Llave foranea con Better Auth
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow(),
});