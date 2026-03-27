import { Hono } from "hono";
import { auth } from "./auth";

type Variables = {
  tenantId: string;
};

export const app = new Hono<{ Variables: Variables }>();

// Tenant middleware
app.use("/api/*", async (c, next) => {
  const tenantId = c.req.header("x-tenant-id");

  if (!tenantId) {
    return c.json({ error: "Missing tenant" }, 400);
  }

  c.set("tenantId", tenantId);
  await next();
});

// Auth routes (Better Auth)
app.all("/api/auth/*", async (c) => {
  return auth.handler(c.req.raw);
});

