import { Hono } from "hono";
import { cors } from "hono/cors";
import type { ApiErrorResponse } from "@/shared/api/error";
import { helloRoute } from "./routes/hello";

export const app = new Hono()
  .use(cors({ origin: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000" }))
  .route("/", helloRoute)
  .notFound((c) => {
    const body: ApiErrorResponse = { error: { message: "Not Found" } };
    return c.json(body, 404);
  })
  .onError((err, c) => {
    console.error("[api] Unhandled error:", err);
    const body: ApiErrorResponse = { error: { message: "Internal Server Error" } };
    return c.json(body, 500);
  });

export type AppType = typeof app;
