import { getConfig } from "@repo/config"
import { useQuery } from "@tanstack/react-query"

import { reviewsFetch } from "./api"
import { Review, ReviewsResponse } from "./types"

const fetchUserAppReview = async (appId: string, author: string): Promise<Review | null> => {
  const res = await reviewsFetch(`/api/v1/xapp/apps/${appId}/reviews?author=${author}&size=1`)
  if (!res.ok) throw new Error(`Reviews fetch error: ${res.status}`)
  const data: ReviewsResponse = await res.json()
  return data.data[0] ?? null
}

export const useUserAppReview = (appId: string, authorAddress?: string) =>
  useQuery({
    queryKey: ["appReviews", appId, "user", authorAddress],
    queryFn: () => fetchUserAppReview(appId, authorAddress!),
    enabled: !!appId && !!authorAddress && !!getConfig().indexerUrl,
  })
