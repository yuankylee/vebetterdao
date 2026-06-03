export type BadgeKey = "topEcosystemDapp" | "topDistributionPerformer" | "navigatorsPick"

export type BadgeStatus = {
  isPublished: boolean
  isLoading: boolean
}

export type BadgeStats = {
  totalEarned: number
  latestRank: number
  isLoading: boolean
}

export type AcquisitionRecord = {
  round: number
  ranking: number | null
  date: string
}
