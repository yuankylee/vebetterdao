import { reviewsFetch } from "./api"
import type { AppReviewEligibilityResponse } from "./types"

export const fetchAppReviewEligibility = async (
  appId: string,
  wallet: string,
): Promise<AppReviewEligibilityResponse> => {
  const params = new URLSearchParams({ wallet })
  const res = await reviewsFetch(`/api/v1/xapp/apps/${appId}/eligibility?${params}`)
  if (!res.ok) throw new Error(`App review eligibility fetch error: ${res.status}`)
  return res.json()
}
