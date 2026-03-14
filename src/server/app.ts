import { Hono } from "hono";
import type { ApiErrorResponse } from "@/shared/api/error";
import { helloRoute } from "./routes/hello";

export const app = new Hono()
  .route("/", helloRoute)
  .notFound((c) => {
    const body: ApiErrorResponse = { error: { message: "Not Found" } };
    return c.json(body, 404);
  })
  .onError((err, c) => {
    console.error(err);
    const body: ApiErrorResponse = { error: { message: "Internal Server Error" } };
    return c.json(body, 500);
  });

export type AppType = typeof app;

