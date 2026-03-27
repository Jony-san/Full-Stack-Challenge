import { Hono } from "hono";
import { pool } from "@/db";
import { drizzle } from "drizzle-orm/node-postgres";
import { contacts } from "@/db/schema";
import type { PoolClient } from "pg";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";


const createContactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

type Variables = {
  dbClient: PoolClient;
};
//Fijar base de rutas y tipear variales
const app = new Hono<{ Variables: Variables }>().basePath("/api");

//Para cada solicitud crear conexion y solicitar cabecera
app.use("*", async (context, next) => {
  const tenantId = context.req.header("x-tenant-id");

  if (!tenantId) {
    return context.json({ error: "Missing tenant" }, 400);
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // ⚠️ IMPORTANTE: interpolación segura
    const safeTenant = tenantId.replace(/'/g, "''");

    await client.query(
      `SET LOCAL app.current_tenant = '${safeTenant}'`
    );

    context.set("dbClient", client);

    await next();

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
});

app.all("/auth/*", async (c) => {
  //console.log("**")
  return auth.handler(c.req.raw);
});

app.get("/example", (context) => {
  console.log("Hono route hit");
  return context.json({ message: "API working" });
});

//Consulta
app.get("/contacts", async (context) => {
  const client = context.get("dbClient");
  const db = drizzle(client);

  const result = await db.select().from(contacts);

  return context.json(result);
});

//Consulta por Id
app.get("/contacts/:id", async (context) => {
  const db = drizzle(context.get("dbClient"));
  const id = context.req.param("id");

  const result = await db
    .select()
    .from(contacts)
    .where(eq(contacts.id, id));

  return context.json(result[0] ?? null);
});

//Creacion
app.post("/contacts", async (context) => {
  const client = context.get("dbClient");
  const db = drizzle(client);

  const body = await context.req.json();

  const parsed = createContactSchema.safeParse(body);

  if (!parsed.success) {
    return context.json({ error: parsed.error }, 400);
  }

  const tenantId = context.req.header("x-tenant-id")!;

  const result = await db.insert(contacts).values({
    tenantId,
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
  }).returning();

  return context.json(result[0], 201);
});


//Eliminar
app.delete("/contacts/:id", async (context) => {
  const client = context.get("dbClient");
  const db = drizzle(client);

  const id = context.req.param("id");

  const result = await db
    .delete(contacts)
    .where(eq(contacts.id, id))
    .returning();

  if (result.length === 0) {
    return context.json({ error: "Not found" }, 404);
  }

  return context.json({ success: true });
});

//Actualizacion
app.put("/contacts/:id", async (context) => {
  const client = context.get("dbClient");
  const db = drizzle(client);

  const id = context.req.param("id");
  const body = await context.req.json();

  const parsed = createContactSchema.partial().safeParse(body);

  if (!parsed.success) {
    return context.json({ error: parsed.error }, 400);
  }

  const result = await db
    .update(contacts)
    .set(parsed.data)
    .where(eq(contacts.id, id))
    .returning();

  if (result.length === 0) {
    return context.json({ error: "Not found" }, 404);
  }

  return context.json(result[0]);
});


app.all("*", (context) =>
  context.json({ error: "Route not found" }, 404)
);

export const GET = (request: Request) => app.fetch(request);
export const POST = (request: Request) => app.fetch(request);
export const PUT = (request: Request) => app.fetch(request);
export const DELETE = (request: Request) => app.fetch(request);
export const PATCH = (request: Request) => app.fetch(request);