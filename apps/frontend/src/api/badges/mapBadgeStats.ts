import dayjs from "dayjs"

import type { XAppBadgeStats, XAppBadgeStatsRound } from "@/api/indexer/xapps/types"

import type { AcquisitionRecord } from "./types"

export const mapAcquisitionRecords = (rounds?: XAppBadgeStatsRound[]): AcquisitionRecord[] => {
  if (!rounds?.length) return []
  return rounds.map(round => ({
    round: round.round,
    ranking: round.rank ?? null,
    date: dayjs(round.date * 1000).format("MMMM D, YYYY"),
  }))
}

export const mapBadgeStatsSummary = (data: XAppBadgeStats | null | undefined) => ({
  totalEarned: data?.totalBadgesEarned ?? 0,
  latestRank: data?.latestBadges ?? null,
  records: mapAcquisitionRecords(data?.rounds),
})
