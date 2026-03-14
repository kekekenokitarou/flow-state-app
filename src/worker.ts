import { app } from "./server/app";

/**
 * Cloudflare Workers entrypoint example.
 *
 * NOTE:
 * - This repo is currently a Next.js app; this file is a reference boilerplate
 *   if you later deploy the same Hono app to Workers with Wrangler.
 */
const worker = {
  fetch(request: Request, env: unknown, ctx: unknown) {
    return app.basePath("/api").fetch(request, env as never, ctx as never);
  },
};

export default worker;

