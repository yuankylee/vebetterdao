import { getConfig } from "@repo/config"
import { useQuery } from "@tanstack/react-query"

import { reviewsFetch } from "./api"
import { VoteHistoryResponse } from "./types"

type UseReviewVotesOptions = {
  search?: string
  page?: number
  size?: number
}

const fetchReviewVotes = async (reviewId: number, options: UseReviewVotesOptions): Promise<VoteHistoryResponse> => {
  const { search, page = 0, size = 50 } = options
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  if (search) params.set("search", search)
  const res = await reviewsFetch(`/api/v1/xapp/reviews/${reviewId}/votes?${params}`)
  if (!res.ok) throw new Error(`Vote history fetch error: ${res.status}`)
  return res.json()
}

export const useReviewVotes = (reviewId: number | undefined, options: UseReviewVotesOptions = {}) =>
  useQuery({
    queryKey: ["reviewVotes", reviewId, options.search, options.page, options.size],
    queryFn: () => fetchReviewVotes(reviewId!, options),
    enabled: !!reviewId && !!getConfig().reviewsApiUrl,
  })
