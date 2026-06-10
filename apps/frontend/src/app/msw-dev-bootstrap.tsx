"use client"

import { useEffect, useState } from "react"

/** Survives React Strict Mode remounts so MSW starts once per page load. */
let mswBootstrap: Promise<void> | null = null

const mswEnabled = process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_ENABLE_MSW === "true"

function startMocks(): Promise<void> {
  if (!mswBootstrap) {
    mswBootstrap = import("@/mocks")
      .then(({ initMocks }) => initMocks())
      .catch(err => {
        console.error("[MSW] Failed to start mocking", err)
      })
  }
  return mswBootstrap
}

/**
 * Dev-only MSW bootstrap. Rendered from `layout.tsx` only when `NODE_ENV === "development"`.
 * Keeps `@/mocks` (and MSW) off the production React tree; `ClientWrapper` stays universal.
 *
 * Gates `children` until the service worker is active so no API request escapes the mock
 * handlers during the first render. When MSW is disabled, children render immediately.
 */
export function MswDevBootstrap({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(!mswEnabled)

  useEffect(() => {
    if (!mswEnabled) return
    if (typeof window === "undefined") return

    let active = true
    startMocks().finally(() => {
      if (active) setReady(true)
    })

    return () => {
      active = false
    }
  }, [])

  if (!ready) return null

  return <>{children}</>
}
