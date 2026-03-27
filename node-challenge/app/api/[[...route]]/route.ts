import { Hono } from "hono";
import { pool } from "@/db";
import { drizzle } from "drizzle-orm/node-postgres";
import { contacts } from "@/db/schema";
import type { PoolClient } from "pg";

export const runtime = "nodejs";

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

app.get("/example", (context) => {
  console.log("Hono route hit");
  return context.json({ message: "API working" });
});

app.get("/contacts", async (context) => {
  const client = context.get("dbClient");
  const db = drizzle(client);

  const result = await db.select().from(contacts);

  return context.json(result);
});

app.all("*", (context) =>
  context.json({ error: "Route not found" }, 404)
);

export const GET = (request: Request) => app.fetch(request);
export const POST = (request: Request) => app.fetch(request);
export const PUT = (request: Request) => app.fetch(request);
export const DELETE = (request: Request) => app.fetch(request);
export const PATCH = (request: Request) => app.fetch(request);