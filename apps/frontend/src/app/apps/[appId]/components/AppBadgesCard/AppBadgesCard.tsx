import { Box, Card, HStack, Heading, Image, Text } from "@chakra-ui/react"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { BADGE_CONFIGS } from "@/api/badges/badgeConfigs"
import { BadgeKey } from "@/api/badges/types"
import { useBadgeStats } from "@/api/badges/useBadgeStats"

import { BadgeHistoryModal } from "./BadgeHistoryModal"

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

type Props = { appId: string }

export const AppBadgesCard = ({ appId }: Props) => {
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

  // Badges with count > 0 come first; ties preserve original order
  const sortedKeys = [...BADGE_CONFIGS]
    .sort((a, b) => (countsMap[b.key] > 0 ? 1 : 0) - (countsMap[a.key] > 0 ? 1 : 0))
    .map(b => b.key)

  return (
    <>
      <Card.Root variant="outline" w="full" h="full">
        <Card.Body p={4}>
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
        </Card.Body>
      </Card.Root>

      <BadgeHistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} appId={appId} />
    </>
  )
}
