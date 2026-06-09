import { Interface } from "ethers"

/** XAppReviewManager — shared ABI fragments for encode/decode (not in typechain package). */
const REVIEW_MANAGER_FRAGMENTS = [
  "function submitRating(bytes32 appId, uint8 rating)",
  "function updateRating(bytes32 appId, uint8 rating)",
  "function createReview(bytes32 appId, string title, string content)",
  "function editReview(uint256 reviewId, string title, string content)",
  "function voteOnReview(uint256 reviewId, uint8 voteType)",
  "event RatingSubmitted(bytes32 indexed appId, address indexed rater, uint8 rating)",
  "event RatingUpdated(bytes32 indexed appId, address indexed rater, uint8 rating)",
  "event ReviewCreated(uint256 indexed reviewId, bytes32 indexed appId, address indexed reviewer)",
  "event ReviewUpdated(uint256 indexed reviewId)",
  "event ReviewVoted(uint256 indexed reviewId, address indexed voter, uint8 voteType)",
  "event ReviewHidden(uint256 indexed reviewId)",
  "event ReviewUnhidden(uint256 indexed reviewId)",
] as const

export const ReviewManagerInterface = new Interface([...REVIEW_MANAGER_FRAGMENTS])
