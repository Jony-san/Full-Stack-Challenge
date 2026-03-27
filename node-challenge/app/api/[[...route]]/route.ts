import { Hono } from "hono";

export const runtime = "nodejs";

const app = new Hono().basePath("/api");

app.get("/example", (context) => {
  console.log("Hono route hit");
  return context.json({ message: "API working" });
});

app.all("*", (context) =>
  context.json({ error: "Route not found" }, 404)
);

export const GET = (request: Request) => app.fetch(request);
export const POST = (request: Request) => app.fetch(request);
export const PUT = (request: Request) => app.fetch(request);
export const DELETE = (request: Request) => app.fetch(request);
export const PATCH = (request: Request) => app.fetch(request);