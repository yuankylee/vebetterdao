// TODO: wire to real API endpoint when available
import { BadgeKey, BadgeStatus } from "./types"

export const useBadgeStatus = (_appId: string, _badgeKey: BadgeKey): BadgeStatus => {
  return { isPublished: true, isLoading: false }
}
