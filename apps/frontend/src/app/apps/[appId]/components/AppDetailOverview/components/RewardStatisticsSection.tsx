import { Heading, SimpleGrid, Skeleton, Text, VStack } from "@chakra-ui/react"
import { FormattingUtils } from "@repo/utils"
import { getCompactFormatter } from "@repo/utils/FormattingUtils"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { useAppAvailableFunds } from "@/api/contracts/x2EarnRewardsPool/hooks/getter/useAppAvailableFunds"
import { useAppRewardsBalance } from "@/api/contracts/x2EarnRewardsPool/hooks/getter/useAppRewardsBalance"
import { useAppRewardDetails } from "@/api/indexer/xallocations/useAppRewardDetails"

import { useCurrentAppInfo } from "../../../hooks/useCurrentAppInfo"

const compact = getCompactFormatter(2)

const StatItem = ({ label, value, postfix }: { label: string; value: string; postfix?: string }) => (
  <VStack align="flex-start" gap={1}>
    <Text textStyle="sm" color="text.subtle">
      {label}
    </Text>
    <Heading size="md" color="brand.primary" display="flex" gap={1}>
      {value}
      {postfix && (
        <Text textStyle="md" color="text.subtle">
          {postfix}
        </Text>
      )}
    </Heading>
  </VStack>
)

const STATS_SKELETON_KEYS = ["rs-0", "rs-1", "rs-2", "rs-3", "rs-4", "rs-5", "rs-6", "rs-7"] as const

const StatsSkeleton = ({ count }: { count: number }) => (
  <SimpleGrid columns={[2, 2, 4]} gap={4} w="full">
    {STATS_SKELETON_KEYS.slice(0, count).map(slotKey => (
      <VStack key={slotKey} align="flex-start" gap={1}>
        <Skeleton w="40%" h="16px" />
        <Skeleton w="60%" h="32px" />
      </VStack>
    ))}
  </SimpleGrid>
)

export const RewardStatisticsSection = () => {
  const { t } = useTranslation()
  const { app } = useCurrentAppInfo()
  const appId = app?.id ?? ""

  const { data: rewardDetails, isLoading: rewardDetailsLoading } = useAppRewardDetails(appId)
  const { data: availableFunds, isLoading: isAvailableFundsLoading } = useAppAvailableFunds(appId)
  const { data: rewardsBalance, isLoading: isRewardsBalanceLoading } = useAppRewardsBalance(appId)

  const totalAppBalance = useMemo(() => {
    return Number(availableFunds?.scaled ?? 0) + Number(rewardsBalance?.scaled ?? 0)
  }, [availableFunds, rewardsBalance])

  const isBalanceLoading = isAvailableFundsLoading || isRewardsBalanceLoading
  const isLoading = rewardDetailsLoading || isBalanceLoading

  const stats = useMemo(() => {
    const d = rewardDetails ?? {
      totalAllocationEarnings: 0,
      averageAllocationPerRound: 0,
      totalRounds: 0,
      totalDistributionPerformance: 0,
      totalDistributed: 0,
      averageDistributionPerRound: 0,
      actionsRewarded: 0,
    }
    const perf = Number(d.totalDistributionPerformance ?? 0)
    return {
      dAppBalance: compact.format(totalAppBalance),
      totalAllocationEarnings: compact.format(d.totalAllocationEarnings ?? 0),
      averageAllocationPerRound: compact.format(d.averageAllocationPerRound ?? 0),
      totalRounds: FormattingUtils.humanNumber(d.totalRounds ?? 0),
      totalDistributionPerformance: perf.toFixed(2),
      totalDistributed: compact.format(d.totalDistributed ?? 0),
      averageDistributionPerRound: compact.format(d.averageDistributionPerRound ?? 0),
      actionsRewarded: FormattingUtils.humanNumber(d.actionsRewarded ?? 0),
    }
  }, [rewardDetails, totalAppBalance])

  if (isLoading) {
    return (
      <VStack gap={6} align="stretch" w="full">
        <StatsSkeleton count={8} />
      </VStack>
    )
  }

  return (
    <VStack gap={6} align="stretch" w="full">
      <SimpleGrid columns={[2, 2, 4]} gap={4} w="full">
        <StatItem label={t("dApp Balance")} value={stats.dAppBalance} postfix={t("B3TR")} />
        <StatItem label={t("Total Allocation Earnings")} value={stats.totalAllocationEarnings} postfix={t("B3TR")} />
        <StatItem
          label={t("Average Allocation Per Round")}
          value={stats.averageAllocationPerRound}
          postfix={t("B3TR")}
        />
        <StatItem label={t("Total Rounds")} value={stats.totalRounds} />
        <StatItem
          label={t("Total Distribution Performance")}
          value={stats.totalDistributionPerformance}
          postfix={t("%")}
        />
        <StatItem label={t("Total Distributed")} value={stats.totalDistributed} postfix={t("B3TR")} />
        <StatItem
          label={t("Average Distribution Per Round")}
          value={stats.averageDistributionPerRound}
          postfix={t("B3TR")}
        />
        <StatItem label={t("Actions Rewarded")} value={stats.actionsRewarded} />
      </SimpleGrid>
    </VStack>
  )
}
