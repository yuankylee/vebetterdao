"use client"

import { Card, HStack, Link, SegmentGroup, Text, useDisclosure, VStack } from "@chakra-ui/react"
import { UilArrowUpRight } from "@iconscout/react-unicons"
import { getCompactFormatter } from "@repo/utils/FormattingUtils"
import { useParams } from "next/navigation"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { useAppRoundUserStats } from "@/api/indexer/actions/useAppRoundUserStats"
import { useAppDistributionPerformance } from "@/api/indexer/xallocations/useAppDistributionPerformance"

import { useXAppMetadata } from "../../../../api/contracts/xApps/hooks/useXAppMetadata"

import { DistributionPerformanceTitleRow } from "./AppDetailOverview/components/DistributionPerformanceInfoPopover"
import { RewardDetailsModal } from "./AppDetailOverview/components/RewardDetailsModal"
import { type Period, RewardHistoryChart } from "./AppDetailOverview/components/RewardHistoryChart"
import { UserStatisticsTitleRow } from "./AppDetailOverview/components/UserStatisticsInfo"
import { UserStatsChart, UserStatsLegend } from "./AppDetailOverview/components/UserStatsChart"

const compact = getCompactFormatter(1)

export const AppRewardStatsCard = () => {
  const { appId } = useParams<{ appId: string }>()
  const { t } = useTranslation()
  const { data: appMetadata } = useXAppMetadata(appId ?? "")
  const { open: isModalOpen, onOpen: onOpenModal, onClose: onCloseModal } = useDisclosure()
  const [distributionPeriod, setDistributionPeriod] = useState<Period>("6M")
  const [userStatsPeriod, setUserStatsPeriod] = useState<Period>("6M")

  const { data: distributionRows, isLoading: distributionLoading } = useAppDistributionPerformance(appId ?? "", {
    range: distributionPeriod,
  })

  const { data: userRoundStats, isLoading: userStatsLoading } = useAppRoundUserStats(
    appId ?? "",
    { range: userStatsPeriod },
    { enabled: !!appId },
  )

  const totalUsersDisplay = useMemo(() => {
    if (userRoundStats?.totalUsers != null) return userRoundStats.totalUsers
    if (userRoundStats?.datas?.length) return Math.max(...userRoundStats.datas.map(d => d.activeUsers), 0)
    return undefined
  }, [userRoundStats])

  return (
    <>
      <Card.Root w="full" variant="primary" gap={2}>
        <Card.Header pb={0} pt={0}>
          <HStack justifyContent="space-between" alignItems="center" w="full">
            <DistributionPerformanceTitleRow />
            <Link textStyle="md" fontWeight="normal" color="actions.secondary.text-lighter" onClick={onOpenModal}>
              {t("More")}
              <UilArrowUpRight />
            </Link>
          </HStack>
        </Card.Header>

        <Card.Body>
          <RewardHistoryChart
            distributionRows={distributionRows}
            isLoading={distributionLoading}
            period={distributionPeriod}
            onPeriodChange={setDistributionPeriod}
          />
        </Card.Body>
      </Card.Root>

      <Card.Root w="full" variant="primary" gap={2}>
        <Card.Header pb={0} pt={0}>
          <UserStatisticsTitleRow />
        </Card.Header>

        <Card.Body>
          <VStack align="stretch" gap={3} w="full">
            <Text textStyle="sm">
              {t("Total Users")}
              {": "}
              <Text as="span" color="blue.600" fontWeight="semibold">
                {totalUsersDisplay != null ? compact.format(totalUsersDisplay) : "-"}
              </Text>
            </Text>
            <HStack justify="space-between" align="center" w="full" flexWrap="wrap" gap={3}>
              <SegmentGroup.Root
                alignSelf="flex-start"
                w="fit-content"
                size={{ base: "sm" }}
                borderRadius="lg"
                value={userStatsPeriod}
                onValueChange={e => setUserStatsPeriod(e.value as Period)}>
                <SegmentGroup.Indicator borderRadius="lg" />
                {(["3M", "6M", "1Y", "All"] as const).map(item => (
                  <SegmentGroup.Item key={item} value={item}>
                    <SegmentGroup.ItemText>{t(item)}</SegmentGroup.ItemText>
                    <SegmentGroup.ItemHiddenInput />
                  </SegmentGroup.Item>
                ))}
              </SegmentGroup.Root>
              <UserStatsLegend />
            </HStack>
            <UserStatsChart stats={userRoundStats} isLoading={userStatsLoading} hideLegend />
          </VStack>
        </Card.Body>
      </Card.Root>

      <RewardDetailsModal
        isOpen={isModalOpen}
        onClose={onCloseModal}
        distributionStrategy={appMetadata?.distribution_strategy ?? ""}
      />
    </>
  )
}
