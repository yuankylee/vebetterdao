"use client"

import { Card, Image, Link, Skeleton, Stack, Text, useDisclosure } from "@chakra-ui/react"
import { UilArrowUpRight } from "@iconscout/react-unicons"
import { useParams } from "next/navigation"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { mapXAppPreviousRoundScore } from "@/api/indexer/xapps/mapXAppPreviousRoundScore"
import { useXAppPreviousRoundScore } from "@/api/indexer/xapps/useXAppPreviousRoundScore"
import { LightMode } from "@/components/ui/color-mode"
import { formatLocalizedShortDateFromSeconds } from "@/utils/formatLocalizedLongDate"

import { APP_SCORE_ACCENT_HEX } from "./appScoreConstants"
import { AppScoreDetailsModal } from "./AppScoreDetailsModal"

export const AppScoreCard = () => {
  const { appId } = useParams<{ appId: string }>()
  const { t, i18n } = useTranslation()
  const { open: isModalOpen, onOpen: onOpenModal, onClose: onCloseModal } = useDisclosure()
  const { data, isLoading } = useXAppPreviousRoundScore(appId ?? "")
  const scoreData = useMemo(() => mapXAppPreviousRoundScore(data), [data])

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
              top={0}
              right={0}
              textStyle="md"
              fontWeight="normal"
              color="actions.secondary.text-lighter"
              onClick={onOpenModal}>
              {t("More")}
              <UilArrowUpRight />
            </Link>
            <Stack gap={0} mb={12}>
              <Skeleton loading={isLoading}>
                <Text textStyle="4xl" mb={1} fontWeight="bold" color={APP_SCORE_ACCENT_HEX}>
                  {scoreData.scoreDisplay}
                </Text>
              </Skeleton>
              <Text textStyle="sm" color="text.subtle">
                {t("App Score")}
              </Text>
            </Stack>
            <Stack>
              <Stack gap={1} mb={6}>
                <Skeleton loading={isLoading}>
                  <Text textStyle="lg" fontWeight="bold" color="text.default">
                    {"#"}
                    {scoreData.rankDisplay}
                  </Text>
                </Skeleton>
                <Text textStyle="sm" color="text.subtle">
                  {t("Ranking")}
                </Text>
              </Stack>
              <Skeleton loading={isLoading}>
                <Text textStyle="lg" fontWeight="semibold" color="text.default">
                  {t("{{date}} (Round #{{round}})", {
                    date:
                      scoreData.roundDate != null
                        ? formatLocalizedShortDateFromSeconds(scoreData.roundDate, i18n.language)
                        : "-",
                    round: scoreData.roundDisplay,
                  })}
                </Text>
              </Skeleton>
            </Stack>
          </Card.Body>
        </Card.Root>
      </LightMode>

      <AppScoreDetailsModal isOpen={isModalOpen} onClose={onCloseModal} scoreData={scoreData} isLoading={isLoading} />
    </>
  )
}
