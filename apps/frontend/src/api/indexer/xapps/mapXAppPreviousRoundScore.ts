import type { XAppPreviousRoundScore } from "./types"

export type AppScoreBreakdownRow = {
  labelKey: "Distribution Efficiency" | "Activity" | "Community" | "Profile Completeness"
  value: number
}

export type AppScoreViewModel = {
  scoreDisplay: string
  rankDisplay: string
  /** Unix seconds for the round date; format at render time with the active locale. */
  roundDate?: number
  roundDisplay: string
  breakdown: AppScoreBreakdownRow[]
}

export const mapXAppPreviousRoundScore = (data: XAppPreviousRoundScore | null | undefined): AppScoreViewModel => {
  const scoreDisplay = data?.score != null ? data.score.toFixed(2) : "-"
  const rankDisplay = data?.rank != null ? String(data.rank) : "-"
  const roundDate = data?.roundDate
  const roundDisplay = data?.round != null ? String(data.round) : "-"

  const breakdown: AppScoreBreakdownRow[] = [
    { labelKey: "Distribution Efficiency", value: data?.distribution ?? 0 },
    { labelKey: "Activity", value: data?.activity ?? 0 },
    { labelKey: "Community", value: data?.community ?? 0 },
    { labelKey: "Profile Completeness", value: data?.health ?? 0 },
  ]

  return { scoreDisplay, rankDisplay, roundDate, roundDisplay, breakdown }
}
