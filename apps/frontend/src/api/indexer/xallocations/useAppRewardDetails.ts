import { indexerQueryClient } from "../api"
import { paths } from "../schema"

type AppRewardDetailsQuery = paths["/api/v1/b3tr/xallocations/reward-details"]["get"]
type AppRewardDetailsQueryResponse = AppRewardDetailsQuery["responses"]["200"]["content"]["*/*"]

/**
 * Fetches indexer reward-details summary for an app (allocations, distribution, actions).
 * @param appId App ID (bytes32 hex)
 * @param options Optional hook options (e.g. enabled)
 */
export const useAppRewardDetails = (appId: string, options?: { enabled?: boolean }) => {
  return indexerQueryClient.useQuery("get", "/api/v1/b3tr/xallocations/reward-details", {
    params: { query: { appId } },
    enabled: options?.enabled !== false && !!appId,
  })
}

export type AppRewardDetails = AppRewardDetailsQueryResponse
