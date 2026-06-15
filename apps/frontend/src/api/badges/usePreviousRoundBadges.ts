import { useMemo } from "react"

import { useXAppPreviousRoundBadges } from "@/api/indexer/xapps/useXAppPreviousRoundBadges"

import { BADGE_CONFIGS } from "./badgeConfigs"
import { mapPreviousRoundBadges } from "./mapPreviousRoundBadges"
import { BadgeKey, PreviousRoundBadge } from "./types"

type UsePreviousRoundBadgesOptions = { enabled?: boolean }

export const usePreviousRoundBadges = (appId: string, options?: UsePreviousRoundBadgesOptions) => {
  const { data, isLoading } = useXAppPreviousRoundBadges(appId, options)
  const mapped = useMemo(() => mapPreviousRoundBadges(data), [data])

  const sortedKeys = useMemo(
    () =>
      [...BADGE_CONFIGS]
        .sort((a, b) => Number(mapped.badgesByKey[b.key].earned) - Number(mapped.badgesByKey[a.key].earned))
        .map(b => b.key),
    [mapped.badgesByKey],
  )

  return {
    round: mapped.round,
    badgesByKey: mapped.badgesByKey as Record<BadgeKey, PreviousRoundBadge>,
    sortedKeys,
    isLoading,
  }
}
