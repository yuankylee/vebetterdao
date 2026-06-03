import { getConfig } from "@repo/config"

export const reviewsFetch = (path: string, init?: RequestInit) => {
  const baseUrl = getConfig().xAppApiUrl
  if (!baseUrl) throw new Error("xAppApiUrl not configured")
  return fetch(`${baseUrl}${path}`, init)
}
