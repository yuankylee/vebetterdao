import { http, HttpResponse, type RequestHandler } from "msw"

/**
 * Template for [`index.ts`](./index.ts). Reset or bootstrap with:
 *
 *   cp apps/frontend/src/mocks/custom-handlers/index.example.ts apps/frontend/src/mocks/custom-handlers/index.ts
 *
 * Default `index.ts` includes a harmless probe route; keep or replace.
 */
export const handlers: RequestHandler[] = [
  http.get("/__msw_local_probe", () => HttpResponse.json({ ok: true, layer: "custom-handlers" })),
]
