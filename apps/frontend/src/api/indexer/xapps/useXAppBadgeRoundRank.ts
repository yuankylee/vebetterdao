import { getConfig } from "@repo/config"
import { useQuery } from "@tanstack/react-query"

import { indexerFetch } from "../api"

import type { XAppBadgeRoundRank, XAppBadgeType } from "./types"

const fetchXAppBadgeRoundRank = async (appId: string, badgeType: XAppBadgeType): Promise<XAppBadgeRoundRank | null> => {
  const params = new URLSearchParams({ badgeType })
  const res = await indexerFetch(`/api/v1/xapp/apps/${appId}/badges/roundRank?${params}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`xapp badge roundRank fetch error: ${res.status}`)
  return res.json()
}

export const getXAppBadgeRoundRankQueryKey = (appId: string, badgeType: XAppBadgeType) =>
  ["xAppBadgeRoundRank", appId, badgeType] as const

/**
 * Current-round badge rank and totals for an xApp.
 * @see GET /api/v1/xapp/apps/{appId}/badges/roundRank?badgeType=
 */
export const useXAppBadgeRoundRank = (appId: string, badgeType: XAppBadgeType, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: getXAppBadgeRoundRankQueryKey(appId, badgeType),
    queryFn: () => fetchXAppBadgeRoundRank(appId, badgeType),
    enabled: options?.enabled !== false && !!appId && !!getConfig().indexerUrl,
  })
