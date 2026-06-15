import { getConfig } from "@repo/config"
import { useQuery } from "@tanstack/react-query"

import { indexerFetch } from "../api"

import type { XAppEarnedBadges } from "./types"

const fetchXAppEarnedBadges = async (appId: string): Promise<XAppEarnedBadges | null> => {
  const res = await indexerFetch(`/api/v1/xapp/apps/${appId}/badges/earned`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`xapp earned badges fetch error: ${res.status}`)
  return res.json()
}

export const getXAppEarnedBadgesQueryKey = (appId: string) => ["xAppEarnedBadges", appId] as const

/**
 * Total earned badge summaries for all badge types.
 * @see GET /api/v1/xapp/apps/{appId}/badges/earned
 */
export const useXAppEarnedBadges = (appId: string, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: getXAppEarnedBadgesQueryKey(appId),
    queryFn: () => fetchXAppEarnedBadges(appId),
    enabled: options?.enabled !== false && !!appId && !!getConfig().indexerUrl,
  })
