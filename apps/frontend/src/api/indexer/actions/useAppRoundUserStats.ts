import { keepPreviousData } from "@tanstack/react-query"

import { indexerQueryClient } from "../api"
import { paths } from "../schema"

type RoundUserStatsQuery = paths["/api/v1/b3tr/actions/apps/{appId}/roundUserStats"]["get"]
export type AppRoundUserStatsQueryOptions = RoundUserStatsQuery["parameters"]["query"]
type AppRoundUserStatsResponse = RoundUserStatsQuery["responses"]["200"]["content"]["*/*"]

export type AppRoundUserStats = AppRoundUserStatsResponse

/**
 * Per-round active / new user counts for the app detail user statistics chart.
 * @see GET /api/v1/b3tr/actions/apps/{appId}/roundUserStats
 */
export const useAppRoundUserStats = (
  appId: string,
  queryOptions: AppRoundUserStatsQueryOptions,
  options?: { enabled?: boolean },
) => {
  return indexerQueryClient.useQuery("get", "/api/v1/b3tr/actions/apps/{appId}/roundUserStats", {
    params: { path: { appId }, query: queryOptions },
    enabled: options?.enabled !== false && !!appId,
    placeholderData: keepPreviousData,
  })
}
