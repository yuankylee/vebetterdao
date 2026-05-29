import { getConfig } from "@repo/config"

export const reviewsFetch = (path: string, init?: RequestInit) => {
  const baseUrl = getConfig().reviewsApiUrl
  if (!baseUrl) throw new Error("reviewsApiUrl not configured")
  return fetch(`${baseUrl}${path}`, init)
}
