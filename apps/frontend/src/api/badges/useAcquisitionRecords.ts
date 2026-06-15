import { useMemo } from "react"

import { useXAppBadgeStats } from "@/api/indexer/xapps/useXAppBadgeStats"

import { mapAcquisitionRecords } from "./mapBadgeStats"
import { AcquisitionRecord, BadgeKey } from "./types"

type UseAcquisitionRecordsOptions = { enabled?: boolean }

export const useAcquisitionRecords = (
  appId: string,
  badgeKey: BadgeKey,
  options?: UseAcquisitionRecordsOptions,
): { records: AcquisitionRecord[]; isLoading: boolean } => {
  const { data, isLoading } = useXAppBadgeStats(appId, badgeKey, options)
  const records = useMemo(() => mapAcquisitionRecords(data?.rounds), [data?.rounds])

  return { records, isLoading }
}
