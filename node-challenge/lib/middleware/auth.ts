import type { Context, Next } from "hono";

export async function requireAuth(c: Context, next: Next) {
  const session = c.get("session");

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  await next();
}