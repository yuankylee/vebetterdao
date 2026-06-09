"use client"

import { Box, Heading, HStack, List, Progress, SimpleGrid, Text, VStack } from "@chakra-ui/react"
import { useTranslation } from "react-i18next"

import { BaseModal } from "@/components/BaseModal"

import { APP_SCORE_ACCENT_HEX, APP_SCORE_MOCK } from "./appScoreMockData"

type AppScoreDetailsModalProps = {
  isOpen: boolean
  onClose: () => void
}

const ScoreBreakdownRow = ({ label, value }: { label: string; value: number }) => (
  <VStack align="stretch" gap={2} w="full">
    <HStack justify="space-between" w="full" align="baseline" gap={3}>
      <Text textStyle="sm" color="text.default">
        {label}
      </Text>
      <Text textStyle="sm" fontWeight="semibold" color="text.default" flexShrink={0}>
        {value.toFixed(2)}
      </Text>
    </HStack>
    <Progress.Root value={value} max={100} size="sm" w="full">
      <Progress.Track rounded="full" bg="bg.muted">
        <Progress.Range bg={APP_SCORE_ACCENT_HEX} rounded="full" />
      </Progress.Track>
    </Progress.Root>
  </VStack>
)

export const AppScoreDetailsModal = ({ isOpen, onClose }: AppScoreDetailsModalProps) => {
  const { t } = useTranslation()
  const m = APP_SCORE_MOCK

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      modalProps={{ size: "4xl" }}
      modalContentProps={{ minW: "1000px", maxW: "min(100vw - 32px, 1200px)" }}>
      <VStack gap={8} align="stretch" w="full">
        <Heading size="2xl">{t("App Score Details")}</Heading>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={{ base: 8, md: 10 }} w="full" alignItems="start">
          <VStack align="flex-start" gap={6}>
            <Text textStyle="4xl" fontWeight="bold" color={APP_SCORE_ACCENT_HEX}>
              {m.score.toFixed(2)}
            </Text>
            <VStack align="flex-start" gap={0}>
              <Text textStyle="lg" fontWeight="bold" color="text.default">
                {"#"}
                {m.ranking}
              </Text>
              <Text textStyle="sm" color="text.subtle">
                {t("Ranking")}
              </Text>
            </VStack>
            <Text textStyle="md" fontWeight="semibold" color="text.default">
              {t("{{date}} (Round #{{round}})", { date: m.roundDate, round: m.roundNumber })}
            </Text>
          </VStack>

          <VStack align="stretch" gap={5} w="full">
            {m.breakdown.map(row => (
              <ScoreBreakdownRow key={row.labelKey} label={t(row.labelKey)} value={row.value} />
            ))}
          </VStack>
        </SimpleGrid>

        <Box bg="#F9F9FA" rounded="xl" p={{ base: 4, md: 6 }} w="full">
          <VStack align="stretch" gap={4}>
            <Heading size="lg">{t("App Score Rules")}</Heading>
            <Text textStyle="md" color="text.subtle">
              {t("App score rules intro")}
            </Text>
            <List.Root as="ul" gap={3} ps={4}>
              <List.Item>
                <Text textStyle="md" color="text.subtle">
                  {t("App score rules bullet profile")}
                </Text>
              </List.Item>
              <List.Item>
                <Text textStyle="md" color="text.subtle">
                  {t("App score rules bullet activity")}
                </Text>
              </List.Item>
              <List.Item>
                <Text textStyle="md" color="text.subtle">
                  {t("App score rules bullet reward payout")}
                </Text>
              </List.Item>
              <List.Item>
                <Text textStyle="md" color="text.subtle">
                  {t("App score rules bullet user satisfaction")}
                </Text>
              </List.Item>
            </List.Root>
            <Text textStyle="md" color="text.subtle">
              {t("App score rules closing")}
            </Text>
          </VStack>
        </Box>
      </VStack>
    </BaseModal>
  )
}
