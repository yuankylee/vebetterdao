import type { XAppPreviousRoundBadges } from "@/api/indexer/xapps/types"

import { BADGE_CONFIGS } from "./badgeConfigs"
import { BadgeKey } from "./types"

const defaultBadgesByKey = (): Record<BadgeKey, PreviousRoundBadge> =>
  Object.fromEntries(BADGE_CONFIGS.map(b => [b.key, { earned: false, rank: null }])) as Record<
    BadgeKey,
    PreviousRoundBadge
  >

export const mapPreviousRoundBadges = (data: XAppPreviousRoundBadges | null | undefined) => {
  const badgesByKey = defaultBadgesByKey()

  data?.badges?.forEach(badge => {
    badgesByKey[badge.badgeType] = {
      earned: badge.earned === 1,
      rank: badge.rank ?? null,
    }
  })

  return {
    round: data?.round ?? null,
    badgesByKey,
  }
}
