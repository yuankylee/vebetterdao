import { getConfig } from "@repo/config"
import { EnhancedClause, UseSendTransactionReturnValue } from "@vechain/vechain-kit"
import { Interface } from "ethers"
import { useCallback } from "react"

import { useBuildTransaction } from "../useBuildTransaction"

const ReviewManagerInterface = new Interface([
  "function editReview(uint256 reviewId, uint8 rating, string title, string content)",
])

type BuildClausesProps = {
  reviewId: number
  rating: number
  title: string
  content: string
}

export type UseEditReviewReturnValue = {
  sendTransaction: (data: BuildClausesProps) => Promise<void>
} & Omit<UseSendTransactionReturnValue, "sendTransaction">

export const useEditReview = ({
  onSuccess,
  onFailure,
}: {
  onSuccess?: () => void
  onFailure?: () => void
} = {}): UseEditReviewReturnValue => {
  const buildClauses = useCallback(
    ({ reviewId, rating, title, content }: BuildClausesProps): EnhancedClause[] => [
      {
        to: getConfig().xAppReviewManagerContractAddress ?? "",
        value: 0,
        data: ReviewManagerInterface.encodeFunctionData("editReview", [reviewId, rating, title, content]),
        comment: "Edit app review",
        abi: JSON.parse(JSON.stringify(ReviewManagerInterface.getFunction("editReview"))),
      },
    ],
    [],
  )

  return useBuildTransaction({ clauseBuilder: buildClauses, onSuccess, onFailure })
}
