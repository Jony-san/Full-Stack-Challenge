import { Hono } from "hono";
import { auth } from "@/lib/auth";

type Variables = {
  dbClient: any; // luego lo tipamos bien con PoolClient
};

export const app = new Hono<{ Variables: Variables }>();

// prueba simple
app.get("/contacts", (c) => {
  return c.json({ ok: true });
});


app.all("/auth/*", (c) => {
  //console.log("URL:", c.req.url);
  //console.log("PATH:", c.req.path);
  //console.log("BASE_URL:", process.env.BASE_URL);
  return auth.handler(c.req.raw);
});