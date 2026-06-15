export type BadgeKey = "topEcosystemDapp" | "topDistributionPerformer" | "navigatorsPick"

export type BadgeStatus = {
  isPublished: boolean
  isLoading: boolean
}

export type BadgeStats = {
  totalEarned: number
  latestRank: number | null
  isLoading: boolean
}

export type AcquisitionRecord = {
  round: number
  ranking: number | null
  date: string
}

export type PreviousRoundBadge = {
  earned: boolean
  rank: number | null
}

export type EarnedBadgeSummary = {
  badgeType: BadgeKey
  badgeName: string
  isPublished: boolean
  totalEarned: number
  latestRank: number | null
  earned: boolean
}
