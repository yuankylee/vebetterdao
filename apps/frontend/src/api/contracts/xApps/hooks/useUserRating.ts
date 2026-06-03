import { getConfig } from "@repo/config"
import { useCallClause } from "@vechain/vechain-kit"

const abi = [
  {
    inputs: [
      { internalType: "bytes32", name: "appId", type: "bytes32" },
      { internalType: "address", name: "user", type: "address" },
    ],
    name: "getUserRating",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
] as const

export const useUserRating = (appId: string, user?: string) =>
  useCallClause({
    abi,
    address: (getConfig().xAppReviewManagerContractAddress ?? "") as `0x${string}`,
    method: "getUserRating",
    args: [appId as `0x${string}`, (user ?? "") as `0x${string}`],
    queryOptions: {
      enabled: !!appId && !!user && !!getConfig().xAppReviewManagerContractAddress,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      select: (data: any) => Number(data[0] as bigint),
    },
  })
