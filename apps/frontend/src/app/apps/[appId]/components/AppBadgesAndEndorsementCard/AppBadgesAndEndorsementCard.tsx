import { Box, Card, HStack, Heading, Image, Separator, Stack, Text } from "@chakra-ui/react"
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
        src={config.image}
        alt={config.title}
        boxSize="64px"
        objectFit="contain"
        filter={hasCount ? undefined : "grayscale(1) opacity(0.35)"}
      />
      {hasCount && (
        <Box
          position="absolute"
          bottom="4px"
          left="50%"
          transform="translateX(-50%)"
          color="white"
          fontSize="11px"
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
      <Card.Root variant="outline" w="full">
        <Card.Body p={0}>
          <Stack direction={["column", "column", "row"]} align="stretch" gap={0}>
            {/* App Badges section */}
            <Box flex={1} p={5}>
              <HStack justify="space-between" align="center" mb={4}>
                <Heading size="md">{t("App Badges")}</Heading>
                <HStack
                  gap={1}
                  cursor="pointer"
                  color="text.subtle"
                  _hover={{ color: "text.default" }}
                  onClick={() => setIsHistoryOpen(true)}>
                  <Text textStyle="sm">{t("More")}</Text>
                  <Text textStyle="sm">{"↗"}</Text>
                </HStack>
              </HStack>
              <HStack gap={3} flexWrap="wrap">
                {sortedKeys.map(key => (
                  <BadgeIcon key={key} badgeKey={key} count={countsMap[key]} />
                ))}
              </HStack>
            </Box>

            {/* Divider */}
            <Separator orientation={["horizontal", "horizontal", "vertical"]} />

            {/* Endorsement section */}
            <Box flex={1} p={5}>
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
