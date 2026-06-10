import { initMocking } from "@msw-mcp/client"
import type { RequestHandler } from "msw"

import { worker } from "./browser"

async function applyOptionalCustomHandlers(): Promise<void> {
  try {
    const mod = await import(`./custom-handlers/${"index"}`)
    const extra = mod.handlers as RequestHandler[] | undefined
    if (Array.isArray(extra) && extra.length > 0) {
      worker.use(...extra)
    }
  } catch {
    // Missing before first `yarn install`, or invalid local file — optional.
  }
}

export async function initMocks(): Promise<void> {
  await applyOptionalCustomHandlers()

  const isWSEnabled =
    process.env.NEXT_PUBLIC_ENABLE_MSW_WS_MOCK === "1" || process.env.NEXT_PUBLIC_ENABLE_MSW_WS_MOCK === "true"

  await initMocking({
    worker,
    wsEnabled: isWSEnabled,
    wsBridgeOptions: {
      url: process.env.NEXT_PUBLIC_MSW_WS_URL || process.env.NEXT_PUBLIC_MCP_SERVER_URL || "ws://localhost:6789",
    },
    workerOptions: {
      onUnhandledRequest: "bypass",
      quiet: false,
      serviceWorker: {
        url: "/mockServiceWorker.js",
      },
    },
  })
}
