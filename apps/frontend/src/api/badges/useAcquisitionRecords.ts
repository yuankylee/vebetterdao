// TODO: wire to real API endpoint when available
import { AcquisitionRecord, BadgeKey } from "./types"

const MOCK_RECORDS: AcquisitionRecord[] = [
  { round: 98, ranking: 1, date: "February 2, 2026" },
  { round: 97, ranking: 1, date: "February 2, 2026" },
  { round: 96, ranking: null, date: "February 2, 2026" },
]

export const useAcquisitionRecords = (
  _appId: string,
  _badgeKey: BadgeKey,
): { records: AcquisitionRecord[]; isLoading: boolean } => {
  return { records: MOCK_RECORDS, isLoading: false }
}
