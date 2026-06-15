import { getConfig } from "@repo/config"
import { useQuery } from "@tanstack/react-query"

import { indexerFetch } from "../api"

import type { XAppBadgeStats, XAppBadgeType } from "./types"

const fetchXAppBadgeStats = async (appId: string, badgeType: XAppBadgeType): Promise<XAppBadgeStats | null> => {
  const params = new URLSearchParams({ badgeType })
  const res = await indexerFetch(`/api/v1/xapp/apps/${appId}/badges/stats?${params}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`xapp badge stats fetch error: ${res.status}`)
  return res.json()
}

export const getXAppBadgeStatsQueryKey = (appId: string, badgeType: XAppBadgeType) =>
  ["xAppBadgeStats", appId, badgeType] as const

/**
 * Badge stats and acquisition history for an xApp.
 * @see GET /api/v1/xapp/apps/{appId}/badges/stats?badgeType=
 */
export const useXAppBadgeStats = (appId: string, badgeType: XAppBadgeType, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: getXAppBadgeStatsQueryKey(appId, badgeType),
    queryFn: () => fetchXAppBadgeStats(appId, badgeType),
    enabled: options?.enabled !== false && !!appId && !!getConfig().indexerUrl,
  })
