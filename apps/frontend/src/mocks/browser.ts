import * as msw from "msw"
import { setupWorker } from "msw/browser"

import { baseHandlers } from "./handlers"

if (typeof window !== "undefined") {
  window.msw = msw
}

export const worker = setupWorker(...baseHandlers)
