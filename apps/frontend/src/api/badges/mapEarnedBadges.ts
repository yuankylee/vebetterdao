import type { XAppEarnedBadges } from "@/api/indexer/xapps/types"

import { BADGE_CONFIGS } from "./badgeConfigs"
import { BadgeKey, EarnedBadgeSummary } from "./types"

const defaultSummary = (key: BadgeKey): EarnedBadgeSummary => {
  const config = BADGE_CONFIGS.find(b => b.key === key)!
  return {
    badgeType: key,
    badgeName: config.title,
    isPublished: false,
    totalEarned: 0,
    latestRank: null,
    earned: false,
  }
}

export const mapEarnedBadges = (data: XAppEarnedBadges | null | undefined) => {
  const badgesByKey = Object.fromEntries(BADGE_CONFIGS.map(b => [b.key, defaultSummary(b.key)])) as Record<
    BadgeKey,
    EarnedBadgeSummary
  >

  data?.badges?.forEach(badge => {
    badgesByKey[badge.badgeType] = {
      badgeType: badge.badgeType,
      badgeName: badge.badgeName,
      isPublished: badge.isPublished,
      totalEarned: badge.totalBadgesEarned,
      latestRank: badge.latestBadges ?? null,
      earned: badge.earned === 1,
    }
  })

  return {
    badgesByKey,
    badges: BADGE_CONFIGS.map(b => badgesByKey[b.key]),
  }
}
