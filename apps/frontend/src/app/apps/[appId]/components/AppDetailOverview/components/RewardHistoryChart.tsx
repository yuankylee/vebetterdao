"use client"

import { Box, Center, SegmentGroup, Skeleton, Text, useToken, VStack } from "@chakra-ui/react"
import { getCompactFormatter } from "@repo/utils/FormattingUtils"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import type { AppDistributionPerformanceRow } from "@/api/indexer/xallocations/useAppDistributionPerformance"

const compact = getCompactFormatter(1)

export type Period = "3M" | "6M" | "1Y" | "All"

// Rounds are ~weekly; map UI periods to server `range` (see GET …/distribution-performance)
export const PERIOD_ROUND_LIMITS: Record<Period, number | null> = {
  "3M": 13,
  "6M": 26,
  "1Y": 52,
  All: null,
}

type ChartDataPoint = {
  round: number
  /** Unix seconds from indexer */
  roundTime: number
  rewards: number
  rewardsDistributed: number
  distributionPerformance: number
}

const BAR_COLOR_KEY = "purple.500"

/*
const metricOptions = [
  { value: "allocations", label: "Allocation Earnings" },
  { value: "rewards", label: "B3TR Distributed" },
  { value: "actions", label: "Actions Rewarded" },
  { value: "users", label: "Unique Users" },
]
*/

const DistributionTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number; payload: ChartDataPoint }[]
  label?: number
}) => {
  const { t, i18n } = useTranslation()

  if (!active || !payload?.length) return null
  const row = payload[0]
  if (!row) return null
  const d = row.payload as ChartDataPoint | undefined
  if (!d) return null

  const datePart =
    d.roundTime > 0
      ? new Intl.DateTimeFormat(i18n.language, {
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(new Date(d.roundTime * 1000))
      : ""

  const roundLabel = t("Round #{{round}}", { round: String(label ?? d.round) })
  const titleLine = datePart ? `${datePart} (${roundLabel})` : roundLabel

  return (
    <Box
      bg="white"
      _dark={{ bg: "gray.800" }}
      border="1px solid"
      borderColor="border"
      borderRadius="lg"
      p={3}
      boxShadow="lg">
      <Text textStyle="xs" fontWeight="semibold" mb={2}>
        {titleLine}
      </Text>
      <Text textStyle="xs" color="text.subtle" mb={1}>
        {t("Distribution Performance")}
        {": "}
        {d.distributionPerformance.toFixed(4)}
        {t("%")}
      </Text>
      <Text textStyle="xs" color="text.subtle" mb={1}>
        {t("Allocation Earnings")}
        {": "}
        {compact.format(d.rewards)} {t("B3TR")}
      </Text>
      <Text textStyle="xs" color="text.subtle">
        {t("B3TR Distributed")}
        {": "}
        {compact.format(d.rewardsDistributed)} {t("B3TR")}
      </Text>
    </Box>
  )
}

export const RewardHistoryChart = ({
  distributionRows,
  isLoading,
  period,
  onPeriodChange,
  showPeriodSelector = true,
}: {
  distributionRows: AppDistributionPerformanceRow[] | undefined
  isLoading: boolean
  period: Period
  onPeriodChange: (period: Period) => void
  showPeriodSelector?: boolean
}) => {
  const { t } = useTranslation()

  const tokenColors = useToken("colors", [BAR_COLOR_KEY])
  const barColor = tokenColors[0]

  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (!distributionRows?.length) return []

    return [...distributionRows]
      .sort((a, b) => a.roundId - b.roundId)
      .map(r => ({
        round: r.roundId,
        roundTime: r.roundTime,
        rewards: r.rewardsAllocationAmount,
        rewardsDistributed: r.b3trDistributed,
        distributionPerformance: r.distributionPerformance,
      }))
  }, [distributionRows])

  if (isLoading) {
    return <Skeleton w="full" h="260px" borderRadius="xl" />
  }

  if (!chartData.length) {
    return (
      <Center w="full" py={6}>
        <Text textStyle="sm" color="text.subtle">
          {t("No round data available yet")}
        </Text>
      </Center>
    )
  }

  return (
    <VStack w="full" align="stretch" gap={3}>
      {showPeriodSelector ? (
        <SegmentGroup.Root
          alignSelf="flex-start"
          w="fit-content"
          size={{ base: "sm" }}
          borderRadius="lg"
          value={period}
          onValueChange={e => onPeriodChange(e.value as Period)}>
          <SegmentGroup.Indicator borderRadius="lg" />
          {["3M", "6M", "1Y", "All"].map(item => (
            <SegmentGroup.Item key={item} value={item}>
              <SegmentGroup.ItemText>{item}</SegmentGroup.ItemText>
              <SegmentGroup.ItemHiddenInput />
            </SegmentGroup.Item>
          ))}
        </SegmentGroup.Root>
      ) : null}

      {/*
      <NativeSelect.Root size="sm" w="auto" minW={{ base: "full", md: "180px" }}>
        <NativeSelect.Field
          value={metric}
          onChange={e => setMetric(e.target.value as ChartMetric)}
          borderRadius="lg"
          textStyle="sm"
          fontWeight="semibold">
          {metricOptions.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>
      */}

      <Box w="full" h="220px">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="round"
              tick={{ fontSize: 11 }}
              tickFormatter={v => `#${v}`}
              stroke="#a0aec0"
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11 }}
              tickFormatter={v => `${Number(v)}%`}
              stroke="#a0aec0"
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<DistributionTooltip />} />
            <Bar
              dataKey="distributionPerformance"
              fill={barColor}
              radius={[4, 4, 0, 0]}
              name={t("Distribution Performance")}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </VStack>
  )
}
