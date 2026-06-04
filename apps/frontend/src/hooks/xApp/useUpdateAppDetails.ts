import { getConfig } from "@repo/config"
import { X2EarnApps__factory } from "@vechain/vebetterdao-contracts/factories/x-2-earn-apps/X2EarnApps__factory"
import { EnhancedClause, UseSendTransactionReturnValue, getCallClauseQueryKeyWithArgs } from "@vechain/vechain-kit"
import { useCallback, useMemo } from "react"

import { getAppAdminQueryKey } from "../../api/contracts/xApps/hooks/useAppAdmin"
import { getXAppMetadataQueryKey } from "../../api/contracts/xApps/hooks/useXAppMetadata"
import { getXAppsQueryKey } from "../../api/contracts/xApps/hooks/useXApps"
import { useBuildTransaction } from "../useBuildTransaction"

const X2EarnAppsInterface = X2EarnApps__factory.createInterface()
const x2EarnAppsAbi = X2EarnApps__factory.abi
const x2EarnAppsAddress = getConfig().x2EarnAppsContractAddress as `0x${string}`
type useUpdateAppDetailsProps = {
  appId: string
  onSuccess?: () => void
  onFailure?: () => void
}
type BuildClausesProps = {
  metadataUri: string
  /** When provided, includes an updateTeamWalletAddress clause in the transaction */
  teamWalletAddress?: string
  /** When provided, includes a setAppAdmin clause in the transaction */
  adminAddress?: string
}
export type useUpdateAppMetadataReturnValue = {
  sendTransaction: (data: BuildClausesProps) => Promise<void>
} & Omit<UseSendTransactionReturnValue, "sendTransaction">
/**
 *  Hook to update the metadata of an app.
 *  Optionally bundles treasury-wallet and admin-address changes in the same transaction.
 * @param param0 appId, onSuccess, onFailure
 * @returns see {@link useUpdateAppMetadataReturnValue}
 */
export const useUpdateAppDetails = ({
  appId,
  onSuccess,
  onFailure,
}: useUpdateAppDetailsProps): useUpdateAppMetadataReturnValue => {
  const buildClauses = useCallback(
    ({ metadataUri, teamWalletAddress, adminAddress }: BuildClausesProps) => {
      const clauses: EnhancedClause[] = [
        {
          to: getConfig().x2EarnAppsContractAddress,
          value: 0,
          data: X2EarnAppsInterface.encodeFunctionData("updateAppMetadata", [appId, metadataUri]),
          comment: "Update app metadata",
          abi: JSON.parse(JSON.stringify(X2EarnAppsInterface.getFunction("updateAppMetadata"))),
        },
      ]

      if (teamWalletAddress) {
        clauses.push({
          to: getConfig().x2EarnAppsContractAddress,
          value: 0,
          data: X2EarnAppsInterface.encodeFunctionData("updateTeamWalletAddress", [
            appId,
            teamWalletAddress as `0x${string}`,
          ]),
          comment: "Update treasury wallet address",
          abi: JSON.parse(JSON.stringify(X2EarnAppsInterface.getFunction("updateTeamWalletAddress"))),
        })
      }

      if (adminAddress) {
        clauses.push({
          to: getConfig().x2EarnAppsContractAddress,
          value: 0,
          data: X2EarnAppsInterface.encodeFunctionData("setAppAdmin", [appId, adminAddress as `0x${string}`]),
          comment: "Update app admin",
          abi: JSON.parse(JSON.stringify(X2EarnAppsInterface.getFunction("setAppAdmin"))),
        })
      }

      return clauses
    },
    [appId],
  )
  const refetchQueryKeys = useMemo(
    () => [
      getXAppsQueryKey(),
      getXAppMetadataQueryKey(appId),
      getAppAdminQueryKey(appId),
      getCallClauseQueryKeyWithArgs<typeof x2EarnAppsAbi, "app">({
        abi: x2EarnAppsAbi,
        address: x2EarnAppsAddress,
        method: "app",
        args: [appId as `0x${string}`],
      }),
    ],
    [appId],
  )

  return useBuildTransaction({
    clauseBuilder: buildClauses,
    refetchQueryKeys,
    onSuccess,
    onFailure,
  })
}
