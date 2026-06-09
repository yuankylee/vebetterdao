export type VoteStats = {
  count: number
  percentage: number
}

export type Review = {
  id: string
  reviewId: number
  appId: string
  author: string
  authorDomain?: string | null
  title: string
  content: string
  upvotes: VoteStats
  downvotes: VoteStats
  reports: VoteStats
  myVoteType?: number // 0=none, 1=upvote, 2=downvote, 3=report; populated when wallet is passed
  isHidden: boolean
  blockTimestamp: number
  documentId: string
}

export type ReviewsResponse = {
  data: Review[]
  pagination: { hasNext: boolean; cursor?: string }
}

/** GET /api/v1/xapp/apps/{appId}/rating */
export type AppRatingSummaryResponse = {
  appId: string
  average: number
  count: number
  userRating: number | null
  hasRated: boolean
}

export type VoteEntry = {
  voter: string
  domain?: string | null
  voteType: 1 | 2 | 3 // 1=upvote, 2=downvote, 3=report
  voteTypeName?: string
  timestamp: number // Unix seconds
}

export type VoteHistoryResponse = {
  data: VoteEntry[]
  pagination: { hasNext: boolean; cursor?: string }
}
