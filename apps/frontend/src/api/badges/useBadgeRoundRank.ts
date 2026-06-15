import { useMemo } from "react"

import { useXAppBadgeRoundRank } from "@/api/indexer/xapps/useXAppBadgeRoundRank"

import { BadgeKey } from "./types"

export type BadgeRoundRank = {
  totalEarned: number
  latestRank: number | null
  isLoading: boolean
}

type UseBadgeRoundRankOptions = { enabled?: boolean }

export const useBadgeRoundRank = (
  appId: string,
  badgeKey: BadgeKey,
  options?: UseBadgeRoundRankOptions,
): BadgeRoundRank => {
  const { data, isLoading } = useXAppBadgeRoundRank(appId, badgeKey, options)

  return useMemo(
    () => ({
      totalEarned: data?.totalBadgesEarned ?? 0,
      latestRank: data?.latestBadges ?? null,
      isLoading,
    }),
    [data, isLoading],
  )
}
