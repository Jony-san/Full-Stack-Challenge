import { Hono } from "hono";

type Variables = {
  dbClient: any; // luego lo tipamos bien con PoolClient
};

export const app = new Hono<{ Variables: Variables }>();

// prueba simple
app.get("/contacts", (c) => {
  return c.json({ ok: true });
});