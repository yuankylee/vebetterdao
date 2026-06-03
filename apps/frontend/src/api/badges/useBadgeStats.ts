// TODO: wire to real API endpoint when available
import { BadgeKey, BadgeStats } from "./types"

export const useBadgeStats = (_appId: string, _badgeKey: BadgeKey): BadgeStats => {
  return { totalEarned: 25, latestRank: 9, isLoading: false }
}
