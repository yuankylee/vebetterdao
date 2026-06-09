import { Box, Card, HStack, Heading, Image, Link, Stack } from "@chakra-ui/react"
import { UilArrowUpRight } from "@iconscout/react-unicons"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { BADGE_CONFIGS } from "@/api/badges/badgeConfigs"
import { BadgeKey } from "@/api/badges/types"
import { useBadgeStats } from "@/api/badges/useBadgeStats"

import { XAppStatus } from "../../../../../types/appDetails"
import { BadgeHistoryModal } from "../AppBadgesCard/BadgeHistoryModal"
import { AppEndorsementInfoCard } from "../AppEndorsementInfoCard/AppEndorsementInfoCard"

type BadgeIconProps = { badgeKey: BadgeKey; count: number }

const BadgeIcon = ({ badgeKey, count }: BadgeIconProps) => {
  const config = BADGE_CONFIGS.find(b => b.key === badgeKey)!
  const hasCount = count > 0
  return (
    <Box position="relative" display="inline-flex" flexShrink={0}>
      <Image
        flex={1}
        src={hasCount ? config.image : config.greyImage}
        alt={config.title}
        boxSize={"80px"}
        objectFit="contain"
        filter={hasCount ? undefined : "grayscale(1) opacity(0.35)"}
      />
      {hasCount && (
        <Box
          position="absolute"
          bottom="6px"
          left="50%"
          transform="translateX(-50%)"
          color="white"
          fontSize="14px"
          fontWeight="bold"
          lineHeight="18px"
          whiteSpace="nowrap">
          {count}
        </Box>
      )}
    </Box>
  )
}

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

  const ecosystemStats = useBadgeStats(appId, "topEcosystemDapp")
  const distributionStats = useBadgeStats(appId, "topDistributionPerformer")
  const navigatorsStats = useBadgeStats(appId, "navigatorsPick")

  const countsMap: Record<BadgeKey, number> = {
    topEcosystemDapp: ecosystemStats.totalEarned,
    topDistributionPerformer: distributionStats.totalEarned,
    navigatorsPick: navigatorsStats.totalEarned,
  }

  const sortedKeys = [...BADGE_CONFIGS]
    .sort((a, b) => (countsMap[b.key] > 0 ? 1 : 0) - (countsMap[a.key] > 0 ? 1 : 0))
    .map(b => b.key)

  return (
    <>
      <Card.Root variant="outline" w="full" px={2} py={0}>
        <Card.Body p={0}>
          <Stack direction={["column", "column", "row"]} align="stretch" gap={0}>
            {/* App Badges section */}
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
                  <BadgeIcon key={key} badgeKey={key} count={countsMap[key]} />
                ))}
              </HStack>
            </Box>

            {/* Endorsement section */}
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
    </>
  )
}
