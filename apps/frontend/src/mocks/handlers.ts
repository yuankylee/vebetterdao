import type { RequestHandler } from "msw"

/** Committed handlers; add `http.get` / `http.post` etc. as needed. */
export const baseHandlers: RequestHandler[] = []
