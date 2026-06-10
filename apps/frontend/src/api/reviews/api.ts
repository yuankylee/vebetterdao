import { getConfig } from "@repo/config"

export const reviewsFetch = (path: string, init?: RequestInit) => {
  const baseUrl = getConfig().indexerUrl?.replace("/api/v1", "")
  if (!baseUrl) throw new Error("indexerUrl not configured")
  return fetch(`${baseUrl}${path}`, init)
}
