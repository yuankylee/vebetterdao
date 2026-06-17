"use client"

import { Box, Center, SegmentGroup, Skeleton, Text, useToken, VStack } from "@chakra-ui/react"
import { getCompactFormatter } from "@repo/utils/FormattingUtils"
import { useEffect, useMemo, useRef } from "react"
import { useTranslation } from "react-i18next"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import type { AppDistributionPerformanceRow } from "@/api/indexer/xallocations/useAppDistributionPerformance"

import { rechartsLinearTicks, rechartsYAxisWidth } from "./rechartsYAxisWidth"

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

/** Y max ≤ 100 with headroom so small % bars stay visible (avoids fixed 0–100 when data is tiny). */
function distributionPerformanceYAxisMax(values: number[]): number {
  if (!values.length) return 100
  const m = Math.max(...values)
  if (!Number.isFinite(m) || m <= 0) return 100
  if (m >= 100) return 100
  const padded = m * 1.15
  const niceSteps = [
    0.01, 0.02, 0.05, 0.1, 0.15, 0.2, 0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 7.5, 10, 12, 15, 20, 25, 30, 40, 50,
    60, 75, 100,
  ]
  const next = niceSteps.find(s => s >= padded) ?? 100
  return Math.min(100, next)
}

const BAR_COLOR_KEY = "purple.500"

const PeriodSelector = ({ period, onPeriodChange }: { period: Period; onPeriodChange: (period: Period) => void }) => {
  const { t } = useTranslation()

  return (
    <SegmentGroup.Root
      alignSelf="flex-start"
      w="fit-content"
      size={{ base: "sm" }}
      borderRadius="lg"
      value={period}
      onValueChange={e => onPeriodChange(e.value as Period)}>
      <SegmentGroup.Indicator borderRadius="lg" />
      {(["3M", "6M", "1Y", "All"] as const).map(item => (
        <SegmentGroup.Item key={item} value={item}>
          <SegmentGroup.ItemText>{t(item)}</SegmentGroup.ItemText>
          <SegmentGroup.ItemHiddenInput />
        </SegmentGroup.Item>
      ))}
    </SegmentGroup.Root>
  )
}

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
        {d.distributionPerformance}
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
  const fetchCompletedOnceRef = useRef(false)

  useEffect(() => {
    if (!isLoading) fetchCompletedOnceRef.current = true
  }, [isLoading])

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

  const distributionYMax = useMemo(
    () => distributionPerformanceYAxisMax(chartData.map(d => d.distributionPerformance)),
    [chartData],
  )

  const distributionYTickFormatter = (v: number) => {
    const n = Number(v)
    if (distributionYMax <= 1) return `${n.toFixed(2)}%`
    if (distributionYMax <= 10) return `${n.toFixed(1)}%`
    return `${Math.round(n)}%`
  }

  const { distributionYTicks, distributionYAxisWidth } = useMemo(() => {
    const ticks = rechartsLinearTicks(distributionYMax)
    const tickLabels = ticks.map(v => {
      if (distributionYMax <= 1) return `${v.toFixed(2)}%`
      if (distributionYMax <= 10) return `${v.toFixed(1)}%`
      return `${Math.round(v)}%`
    })
    return { distributionYTicks: ticks, distributionYAxisWidth: rechartsYAxisWidth(tickLabels) }
  }, [distributionYMax])

  const chartArea =
    isLoading && !chartData.length && !fetchCompletedOnceRef.current ? (
      <Skeleton w="full" h="220px" borderRadius="xl" />
    ) : !chartData.length ? (
      <Center w="full" py={6}>
        <Text textStyle="sm" color="text.subtle">
          {t("No round data available yet")}
        </Text>
      </Center>
    ) : (
      <>
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

        <Box
          mt={2}
          w="full"
          h="220px"
          css={{
            "& .recharts-wrapper": { outline: "none" },
            "& .recharts-wrapper:focus, & .recharts-wrapper:focus-visible": { outline: "none" },
            "& .recharts-surface": { outline: "none" },
            "& .recharts-surface:focus, & .recharts-surface:focus-visible": { outline: "none" },
            "& svg": { outline: "none" },
            "& svg:focus, & svg:focus-visible": { outline: "none" },
            "& .recharts-wrapper g": { outline: "none" },
            "& .recharts-wrapper g:focus, & .recharts-wrapper g:focus-visible": { outline: "none" },
          }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart accessibilityLayer={false} data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
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
                width={distributionYAxisWidth}
                domain={[0, distributionYMax]}
                ticks={distributionYTicks}
                tick={{ fontSize: 11 }}
                tickFormatter={distributionYTickFormatter}
                stroke="#a0aec0"
                axisLine={false}
                tickLine={false}
                tickMargin={4}
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
      </>
    )

  return (
    <VStack w="full" align="stretch" gap={3}>
      {showPeriodSelector ? <PeriodSelector period={period} onPeriodChange={onPeriodChange} /> : null}
      {chartArea}
    </VStack>
  )
}
