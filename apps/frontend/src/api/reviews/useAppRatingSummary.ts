import { getConfig } from "@repo/config"
import { useQuery } from "@tanstack/react-query"

import { reviewsFetch } from "./api"
import type { AppRatingSummaryResponse } from "./types"

const fetchAppRatingSummary = async (appId: string, wallet?: string): Promise<AppRatingSummaryResponse> => {
  const params = new URLSearchParams()
  if (wallet) params.set("wallet", wallet)
  const q = params.toString()
  const path = `/api/v1/xapp/apps/${appId}/rating${q ? `?${q}` : ""}`
  const res = await reviewsFetch(path)
  if (!res.ok) throw new Error(`App rating fetch error: ${res.status}`)
  return res.json()
}

export const getAppRatingSummaryQueryKey = (appId: string, wallet?: string) =>
  ["appRatingSummary", appId, wallet ?? ""] as const

/**
 * GET /api/v1/xapp/apps/{appId}/rating — aggregate + optional current user rating when `wallet` is set.
 */
export const useAppRatingSummary = (appId: string, wallet?: string) =>
  useQuery({
    queryKey: getAppRatingSummaryQueryKey(appId, wallet),
    queryFn: () => fetchAppRatingSummary(appId, wallet),
    enabled: !!appId && !!getConfig().xAppApiUrl,
  })
