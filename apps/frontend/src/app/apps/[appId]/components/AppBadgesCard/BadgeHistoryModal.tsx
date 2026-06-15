import { Box, HStack, Heading, Image, Skeleton, Text, VStack } from "@chakra-ui/react"
import { UilTimes } from "@iconscout/react-unicons"
import { useTranslation } from "react-i18next"

import { BADGE_CONFIGS } from "@/api/badges/badgeConfigs"
import { EarnedBadgeSummary } from "@/api/badges/types"
import { useEarnedBadges } from "@/api/badges/useEarnedBadges"
import { BaseModal } from "@/components/BaseModal"

const BadgeHistoryRow = ({ badge, isLoading }: { badge: EarnedBadgeSummary; isLoading: boolean }) => {
  const { t } = useTranslation()
  const config = BADGE_CONFIGS.find(b => b.key === badge.badgeType)!

  return (
    <HStack gap={2} p={4} border="1px solid" bg="#F9F9FA" borderColor="#E7E9EB" rounded="xl" w="full">
      <Box flexShrink={0}>
        <Image
          src={badge.earned ? config.image : config.greyImage}
          alt={badge.badgeName}
          boxSize="61px"
          objectFit="contain"
          filter={badge.earned ? undefined : "grayscale(1) opacity(0.35)"}
        />
      </Box>
      <VStack align="flex-start" gap={0.5}>
        <Text textStyle="md" fontWeight="semibold">
          {badge.badgeName}
        </Text>
        <HStack gap={4} flexWrap="wrap">
          <Text textStyle="sm" color="text.subtle">
            {t("Total Badges Earned")}
            {": "}
            <Skeleton as="span" loading={isLoading} display="inline-block">
              {badge.totalEarned}
            </Skeleton>
          </Text>
          <Text textStyle="sm" color="text.subtle">
            {t("Latest Badges")}
            {": "}
            <Skeleton as="span" loading={isLoading} display="inline-block">
              {badge.latestRank != null ? `#${badge.latestRank}` : "-"}
            </Skeleton>
          </Text>
        </HStack>
      </VStack>
    </HStack>
  )
}

type Props = { isOpen: boolean; onClose: () => void; appId: string }

export const BadgeHistoryModal = ({ isOpen, onClose, appId }: Props) => {
  const { t } = useTranslation()
  const { badges, isLoading } = useEarnedBadges(appId, { enabled: isOpen })

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      isCloseable
      modalContentProps={{ maxW: "682px" }}
      modalBodyProps={{ p: 6 }}>
      <HStack justify="space-between" align="center" pb={4}>
        <Heading size="xl">{t("Badge History")}</Heading>
        <Box cursor="pointer" onClick={onClose} display={{ base: "none", lg: "block" }}>
          <UilTimes size="24px" />
        </Box>
      </HStack>
      <VStack w="full" gap={3} mt={2}>
        {badges.map(badge => (
          <BadgeHistoryRow key={badge.badgeType} badge={badge} isLoading={isLoading} />
        ))}
      </VStack>
    </BaseModal>
  )
}
