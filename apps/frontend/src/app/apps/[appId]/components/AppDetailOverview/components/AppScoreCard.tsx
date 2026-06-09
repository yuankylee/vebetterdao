"use client"

import { Card, Image, Link, Stack, Text, useDisclosure } from "@chakra-ui/react"
import { UilArrowUpRight } from "@iconscout/react-unicons"
import { useTranslation } from "react-i18next"

import { LightMode } from "@/components/ui/color-mode"

import { AppScoreDetailsModal } from "./AppScoreDetailsModal"
import { APP_SCORE_ACCENT_HEX, APP_SCORE_MOCK } from "./appScoreMockData"
// TODO: replace with real data from backend API
// const MOCK_SCORE = 85.12
// const MOCK_RANKING = 20
// const MOCK_ROUND_DATE = "9 Dec, 2025"
// const MOCK_ROUND_NUMBER = 77

export const AppScoreCard = () => {
  const { t } = useTranslation()
  const { open: isModalOpen, onOpen: onOpenModal, onClose: onCloseModal } = useDisclosure()
  const m = APP_SCORE_MOCK

  return (
    <>
      <LightMode>
        <Card.Root
          variant="primary"
          position="relative"
          h="full"
          overflow="hidden"
          bg="#E9FDF1"
          border="none"
          _dark={{
            bg: "green.50",
          }}>
          <Image
            src="/assets/images/score-card-bg.webp"
            alt=""
            w="224px"
            h="280px"
            position="absolute"
            objectFit="contain"
            right={0}
            top={0}
          />
          <Card.Body position="relative" zIndex={1} alignItems="flex-start" color="text.default">
            <Link
              position="absolute"
              top={4}
              right={4}
              textStyle="md"
              fontWeight="normal"
              color="actions.secondary.text-lighter"
              onClick={onOpenModal}>
              {t("More")}
              <UilArrowUpRight />
            </Link>
            <Stack gap={0} mb={10}>
              <Text textStyle="4xl" fontWeight="bold" color={APP_SCORE_ACCENT_HEX}>
                {m.score.toFixed(2)}
              </Text>
              <Text textStyle="sm" color="text.subtle">
                {t("App Score")}
              </Text>
            </Stack>
            <Stack gap={4}>
              <Stack gap={0}>
                <Text textStyle="lg" fontWeight="bold" color="text.default">
                  {"#"}
                  {m.ranking}
                </Text>
                <Text textStyle="sm" color="text.subtle">
                  {t("Ranking")}
                </Text>
              </Stack>
              <Text textStyle="md" fontWeight="semibold" color="text.default">
                {t("{{date}} (Round #{{round}})", { date: m.roundDate, round: m.roundNumber })}
              </Text>
            </Stack>
          </Card.Body>
        </Card.Root>
      </LightMode>

      <AppScoreDetailsModal isOpen={isModalOpen} onClose={onCloseModal} />
    </>
  )
}
