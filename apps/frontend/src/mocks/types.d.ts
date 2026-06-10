import type * as msw from "msw"

declare global {
  interface Window {
    msw: typeof msw
    /** Set by `@msw-mcp/client` when the WebSocket bridge is enabled. */
    __mswBridge?: unknown
  }
}

export {}
