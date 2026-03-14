# Directory structure (Next.js App Router + Hono RPC)

## Goals

- **Type-safe**: Share types between frontend and backend via `AppType` (Hono RPC).
- **Separation of concerns**: UI / API routes / business logic / shared types.
- **Maintainable**: Feature growth without “spaghetti routes”.

## Proposed structure

```
src/
  app/                       # Next.js (App Router)
    api/[[...route]]/        # Next Route Handler -> Hono adapter
    layout.tsx
    page.tsx
  components/                # Presentational UI components (no data fetching)
  features/                  # (recommended) Feature modules (UI + hooks + queries)
  hooks/                     # Generic React hooks (UI state etc.)
  lib/                       # Client-side utilities
    api/                     # RPC client, fetch wrappers
  server/                    # Hono “core app” (framework-agnostic)
    app.ts                   # Compose routes + error handling, export `AppType`
    routes/                  # Route modules (Hono sub-apps)
    services/                # Business logic (pure functions)
  shared/                    # Shared types (DTOs, error shapes, etc.)
    api/
```

## Layering rules (recommended)

### 1) `shared/`
- Only types/constants. No runtime imports from `server/` or `app/`.

### 2) `server/services/`
- Pure business logic (easy to test).
- No Hono `Context` usage.

### 3) `server/routes/`
- Define routes *inline with paths* (Hono best practice).
- Call services here.
- Keep validation/auth middleware here.

### 4) Adapters
- `src/app/api/[[...route]]/route.ts`: Next.js adapter (Node runtime).
- `src/worker.ts`: Cloudflare Workers adapter (example).

## Type-safe RPC

- Server exports `export type AppType = typeof app` from `src/server/app.ts`.
- Client uses `hc<AppType>('/api')` from `hono/client` (`src/lib/api/client.ts`).
- Result: request/response types are inferred without duplicating API schemas.

