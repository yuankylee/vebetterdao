import { getConfig } from "@repo/config"
import { useCallClause } from "@vechain/vechain-kit"

const abi = [
  {
    inputs: [{ internalType: "bytes32", name: "appId", type: "bytes32" }],
    name: "getAppRatingStats",
    outputs: [
      { internalType: "uint256", name: "count", type: "uint256" },
      { internalType: "uint256", name: "avgRating", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const

export const useAppRatingStats = (appId: string) =>
  useCallClause({
    abi,
    address: (getConfig().xAppReviewManagerContractAddress ?? "") as `0x${string}`,
    method: "getAppRatingStats",
    args: [appId as `0x${string}`],
    queryOptions: {
      enabled: !!appId && !!getConfig().xAppReviewManagerContractAddress,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      select: (data: any) => data[0] as { count: bigint; avgRating: bigint },
    },
  })
