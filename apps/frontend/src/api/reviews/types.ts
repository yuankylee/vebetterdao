export type Review = {
  id: string
  reviewId: number
  appId: string
  author: string
  rating: number
  title: string
  content: string
  upvotes: number
  downvotes: number
  reports: number
  isHidden: boolean
  blockTimestamp: number
  documentId: string
}

export type ReviewsResponse = {
  data: Review[]
  pagination: { hasNext: boolean; cursor?: string }
}

export type VoteEntry = {
  voter: string
  voteType: 1 | 2 | 3 // 1=upvote, 2=downvote, 3=report
  timestamp: number // Unix seconds
}

export type VoteHistoryResponse = {
  data: VoteEntry[]
  pagination: { hasNext: boolean; cursor?: string }
}
