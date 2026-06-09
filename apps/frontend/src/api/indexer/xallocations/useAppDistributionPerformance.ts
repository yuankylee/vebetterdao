import { indexerQueryClient } from "../api"
import { paths } from "../schema"

type DistributionPerfQuery = paths["/api/v1/b3tr/xallocations/distribution-performance"]["get"]
export type AppDistributionPerformanceQueryOptions = DistributionPerfQuery["parameters"]["query"]
type DistributionPerfResponse = DistributionPerfQuery["responses"]["200"]["content"]["*/*"]

/** One round from GET /api/v1/b3tr/xallocations/distribution-performance */
export type AppDistributionPerformanceRow = DistributionPerfResponse[number]

/**
 * @param appId App ID (bytes32 hex)
 * @param queryOptions `range` filters rounds server-side (`3M` | `6M` | `1Y` | `All`)
 */
export const useAppDistributionPerformance = (
  appId: string,
  queryOptions?: Pick<AppDistributionPerformanceQueryOptions, "range">,
  options?: { enabled?: boolean },
) => {
  return indexerQueryClient.useQuery("get", "/api/v1/b3tr/xallocations/distribution-performance", {
    params: { query: { appId, ...queryOptions } },
    enabled: options?.enabled !== false && !!appId,
  })
}
