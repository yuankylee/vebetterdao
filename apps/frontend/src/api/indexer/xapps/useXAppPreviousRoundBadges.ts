import { getConfig } from "@repo/config"
import { useQuery } from "@tanstack/react-query"

import { indexerFetch } from "../api"

import type { XAppPreviousRoundBadges } from "./types"

const fetchXAppPreviousRoundBadges = async (appId: string): Promise<XAppPreviousRoundBadges | null> => {
  const res = await indexerFetch(`/api/v1/xapp/apps/${appId}/badges/previousRound`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`xapp previousRound badges fetch error: ${res.status}`)
  return res.json()
}

export const getXAppPreviousRoundBadgesQueryKey = (appId: string) => ["xAppPreviousRoundBadges", appId] as const

/**
 * Previous-round badge earn status and ranks for all badge types.
 * @see GET /api/v1/xapp/apps/{appId}/badges/previousRound
 */
export const useXAppPreviousRoundBadges = (appId: string, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: getXAppPreviousRoundBadgesQueryKey(appId),
    queryFn: () => fetchXAppPreviousRoundBadges(appId),
    enabled: options?.enabled !== false && !!appId && !!getConfig().indexerUrl,
  })
