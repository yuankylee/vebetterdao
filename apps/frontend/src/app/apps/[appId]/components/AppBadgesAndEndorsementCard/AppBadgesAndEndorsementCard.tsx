import { Box, Card, HStack, Heading, Link, Stack } from "@chakra-ui/react"
import { UilArrowUpRight } from "@iconscout/react-unicons"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { BADGE_CONFIGS } from "@/api/badges/badgeConfigs"
import { BadgeKey } from "@/api/badges/types"
import { usePreviousRoundBadges } from "@/api/badges/usePreviousRoundBadges"

import { XAppStatus } from "../../../../../types/appDetails"
import { AppBadgeDetailModal } from "../AppBadgesCard/AppBadgeDetailModal"
import { BadgeHistoryModal } from "../AppBadgesCard/BadgeHistoryModal"
import { BadgeIcon } from "../AppBadgesCard/BadgeIcon"
import { AppEndorsementInfoCard } from "../AppEndorsementInfoCard/AppEndorsementInfoCard"

type Props = {
  appId: string
  endorsementScore?: string
  endorsementStatus: XAppStatus
  endorsementThreshold?: string
  isEndorsementStatusLoading: boolean
}

export const AppBadgesAndEndorsementCard = ({
  appId,
  endorsementScore,
  endorsementStatus,
  endorsementThreshold,
  isEndorsementStatusLoading,
}: Props) => {
  const { t } = useTranslation()
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [openBadgeKey, setOpenBadgeKey] = useState<BadgeKey | null>(null)

  const { badgesByKey, sortedKeys } = usePreviousRoundBadges(appId)

  const openBadge = BADGE_CONFIGS.find(b => b.key === openBadgeKey) ?? BADGE_CONFIGS[0]

  return (
    <>
      <Card.Root variant="outline" w="full" px={2} py={0}>
        <Card.Body p={0}>
          <Stack direction={["column", "column", "row"]} align="stretch" gap={0}>
            <Box flex={1} p={4}>
              <HStack justify="space-between" align="center" mb={4}>
                <Heading size="xl">{t("App Badges")}</Heading>
                <Link
                  textStyle="md"
                  fontWeight="normal"
                  color="actions.secondary.text-lighter"
                  onClick={() => setIsHistoryOpen(true)}>
                  {t("More")}
                  <UilArrowUpRight />
                </Link>
              </HStack>
              <HStack gap={3} justify="space-between" px={5}>
                {sortedKeys.map(key => (
                  <BadgeIcon
                    key={key}
                    badgeKey={key}
                    earned={badgesByKey[key].earned}
                    rank={badgesByKey[key].rank}
                    size="md"
                    onClick={() => setOpenBadgeKey(key)}
                  />
                ))}
              </HStack>
            </Box>

            <Box flex={1} p={4}>
              <AppEndorsementInfoCard
                noCard
                endorsementScore={endorsementScore}
                endorsementStatus={endorsementStatus}
                endorsementThreshold={endorsementThreshold}
                isEndorsementStatusLoading={isEndorsementStatusLoading}
              />
            </Box>
          </Stack>
        </Card.Body>
      </Card.Root>

      <BadgeHistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} appId={appId} />
      <AppBadgeDetailModal
        isOpen={!!openBadgeKey}
        onClose={() => setOpenBadgeKey(null)}
        badge={openBadge}
        appId={appId}
      />
    </>
  )
}
