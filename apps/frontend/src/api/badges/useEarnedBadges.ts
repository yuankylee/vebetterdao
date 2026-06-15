import { useMemo } from "react"

import { useXAppEarnedBadges } from "@/api/indexer/xapps/useXAppEarnedBadges"

import { mapEarnedBadges } from "./mapEarnedBadges"
import { BadgeKey, EarnedBadgeSummary } from "./types"

type UseEarnedBadgesOptions = { enabled?: boolean }

export const useEarnedBadges = (appId: string, options?: UseEarnedBadgesOptions) => {
  const { data, isLoading } = useXAppEarnedBadges(appId, options)
  const mapped = useMemo(() => mapEarnedBadges(data), [data])

  return {
    badges: mapped.badges,
    badgesByKey: mapped.badgesByKey as Record<BadgeKey, EarnedBadgeSummary>,
    isLoading,
  }
}
