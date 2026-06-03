import { getConfig } from "@repo/config"
import { useQuery } from "@tanstack/react-query"

import { reviewsFetch } from "./api"
import { ReviewsResponse } from "./types"

type UseAppReviewsOptions = {
  page?: number // 0-based
  size?: number
  sortBy?: string
  wallet?: string
}

const fetchAppReviews = async (appId: string, options: UseAppReviewsOptions): Promise<ReviewsResponse> => {
  const { page = 0, size = 2, sortBy, wallet } = options
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  if (sortBy) params.set("sortBy", sortBy)
  if (wallet) params.set("wallet", wallet)
  const res = await reviewsFetch(`/api/v1/xapp/apps/${appId}/reviews?${params}`)
  if (!res.ok) throw new Error(`Reviews fetch error: ${res.status}`)
  return res.json()
}

export const useAppReviews = (appId: string, options: UseAppReviewsOptions = {}) =>
  useQuery({
    queryKey: ["appReviews", appId, options.page ?? 0, options.size ?? 2, options.sortBy, options.wallet],
    queryFn: () => fetchAppReviews(appId, options),
    enabled: !!appId && !!getConfig().xAppApiUrl,
  })
