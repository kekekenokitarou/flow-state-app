import { hc } from "hono/client";
import type { AppType } from "@/server/app";

/**
 * Type-safe API client powered by Hono RPC.
 *
 * - Browser/Next runtime: relative base URL (`/api`)
 * - Local dev: same-origin
 */
export const apiClient = hc<AppType>("/api");

