import { Hono } from "hono";
import type { HelloResponse } from "@/shared/api/hello";
import { getHelloMessage } from "../services/hello";

export const helloRoute = new Hono().get("/hello", (c) => {
  const res: HelloResponse = { message: getHelloMessage() };
  return c.json(res);
});

