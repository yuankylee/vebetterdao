import { useMemo } from "react"

import { useXAppBadgeStats } from "@/api/indexer/xapps/useXAppBadgeStats"

import { mapBadgeStatsSummary } from "./mapBadgeStats"
import { BadgeKey, BadgeStats } from "./types"

type UseBadgeStatsOptions = { enabled?: boolean }

export const useBadgeStats = (appId: string, badgeKey: BadgeKey, options?: UseBadgeStatsOptions): BadgeStats => {
  const { data, isLoading } = useXAppBadgeStats(appId, badgeKey, options)
  const summary = useMemo(() => mapBadgeStatsSummary(data), [data])

  return {
    totalEarned: summary.totalEarned,
    latestRank: summary.latestRank,
    isLoading,
  }
}
