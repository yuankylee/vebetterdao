"use client"

import { Box, Center, HStack, Skeleton, Text, VStack } from "@chakra-ui/react"
import { getCompactFormatter } from "@repo/utils/FormattingUtils"
import { useEffect, useMemo, useRef } from "react"
import { useTranslation } from "react-i18next"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import type { AppRoundUserStats } from "@/api/indexer/actions/useAppRoundUserStats"
import { toIntlLocale } from "@/utils/formatLocalizedLongDate"

const compact = getCompactFormatter(1)

/** Design-spec bar colors (user statistics) */
export const USER_STATS_ACTIVE_HEX = "#6DCB09"
export const USER_STATS_NEW_HEX = "#004CFC"

type ChartRow = {
  round: number
  roundDate: number
  activeUsers: number
  newUsers: number
}

function userStatsIntegerYTicks(yMaxInt: number): number[] {
  const cap = Math.max(1, yMaxInt)
  if (cap <= 12) {
    return Array.from({ length: cap + 1 }, (_, i) => i)
  }
  const step = Math.max(1, Math.ceil(cap / 5))
  const ticks: number[] = [0]
  for (let v = step; v < cap; v += step) ticks.push(v)
  if (ticks[ticks.length - 1] !== cap) ticks.push(cap)
  return ticks
}

const UserStatsTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { name?: string; value: number; payload: ChartRow }[]
  label?: number
}) => {
  const { t, i18n } = useTranslation()

  if (!active || !payload?.length) return null
  const first = payload[0]
  if (!first) return null
  const d = first.payload as ChartRow | undefined
  if (!d) return null

  const datePart =
    d.roundDate > 0
      ? new Intl.DateTimeFormat(toIntlLocale(i18n.language), {
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(new Date(d.roundDate * 1000))
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
        {t("Active Users")}
        {": "}
        {compact.format(d.activeUsers)}
      </Text>
      <Text textStyle="xs" color="text.subtle">
        {t("New Users")}
        {": "}
        {compact.format(d.newUsers)}
      </Text>
    </Box>
  )
}

export const UserStatsLegend = () => {
  const { t } = useTranslation()

  return (
    <HStack gap={4} flexWrap="wrap" justify="flex-end">
      <HStack gap={1.5} alignItems="center">
        <Box boxSize={2.5} borderRadius="sm" bg={USER_STATS_ACTIVE_HEX} flexShrink={0} />
        <Text textStyle="xs" color="text.subtle">
          {t("Active Users")}
        </Text>
      </HStack>
      <HStack gap={1.5} alignItems="center">
        <Box boxSize={2.5} borderRadius="sm" bg={USER_STATS_NEW_HEX} flexShrink={0} />
        <Text textStyle="xs" color="text.subtle">
          {t("New Users")}
        </Text>
      </HStack>
    </HStack>
  )
}

export const UserStatsChart = ({
  stats,
  isLoading,
  hideLegend = false,
}: {
  stats: AppRoundUserStats | undefined
  isLoading: boolean
  hideLegend?: boolean
}) => {
  const { t } = useTranslation()
  const fetchCompletedOnceRef = useRef(false)

  useEffect(() => {
    if (!isLoading) fetchCompletedOnceRef.current = true
  }, [isLoading])

  const chartData = useMemo<ChartRow[]>(() => {
    if (!stats?.datas?.length) return []
    return [...stats.datas]
      .sort((a, b) => a.round - b.round)
      .map(d => ({
        round: d.round,
        roundDate: d.roundDate,
        activeUsers: d.activeUsers,
        newUsers: d.newUsers,
      }))
  }, [stats])

  const { userStatsYDomainMax, userStatsYTicks } = useMemo(() => {
    let raw = 0
    for (const d of chartData) {
      raw = Math.max(raw, d.activeUsers, d.newUsers)
    }
    const domainMax = Math.max(1, Math.ceil(raw * 1.05))
    return { userStatsYDomainMax: domainMax, userStatsYTicks: userStatsIntegerYTicks(domainMax) }
  }, [chartData])

  if (isLoading && !chartData.length && !fetchCompletedOnceRef.current) {
    return <Skeleton w="full" h="240px" borderRadius="xl" />
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
    <VStack w="full" align="stretch" gap={3} mt={2}>
      {hideLegend ? null : <UserStatsLegend />}

      <Box
        w="full"
        h="240px"
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
          <BarChart
            accessibilityLayer={false}
            data={chartData}
            margin={{ top: 4, right: 4, left: 4, bottom: 0 }}
            barCategoryGap="18%">
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
              domain={[0, userStatsYDomainMax]}
              ticks={userStatsYTicks}
              tick={{ fontSize: 11 }}
              tickFormatter={v => String(Math.round(Number(v)))}
              stroke="#a0aec0"
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<UserStatsTooltip />} />
            <Bar dataKey="activeUsers" name={t("Active Users")} fill={USER_STATS_ACTIVE_HEX} radius={[4, 4, 0, 0]} />
            <Bar dataKey="newUsers" name={t("New Users")} fill={USER_STATS_NEW_HEX} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </VStack>
  )
}
