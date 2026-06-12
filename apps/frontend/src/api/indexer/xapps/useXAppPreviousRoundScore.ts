import { getConfig } from "@repo/config"
import { useQuery } from "@tanstack/react-query"

import { indexerFetch } from "../api"

import type { XAppPreviousRoundScore } from "./types"

const fetchXAppPreviousRoundScore = async (appId: string): Promise<XAppPreviousRoundScore | null> => {
  const res = await indexerFetch(`/api/v1/xapp/apps/${appId}/scores/previousRound`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`xapp previousRound score fetch error: ${res.status}`)
  return res.json()
}

export const getXAppPreviousRoundScoreQueryKey = (appId: string) => ["xAppPreviousRoundScore", appId] as const

/**
 * Previous allocation round score for an xApp.
 * @see GET /api/v1/xapp/apps/{appId}/scores/previousRound
 */
export const useXAppPreviousRoundScore = (appId: string) =>
  useQuery({
    queryKey: getXAppPreviousRoundScoreQueryKey(appId),
    queryFn: () => fetchXAppPreviousRoundScore(appId),
    enabled: !!appId && !!getConfig().indexerUrl,
  })
