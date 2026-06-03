import { Box, HStack, Heading, Image, Text, VStack } from "@chakra-ui/react"
import { UilTimes } from "@iconscout/react-unicons"
import { useTranslation } from "react-i18next"

import { BADGE_CONFIGS } from "@/api/badges/badgeConfigs"
import { BadgeKey } from "@/api/badges/types"
import { useBadgeStats } from "@/api/badges/useBadgeStats"
import { BaseModal } from "@/components/BaseModal"

type BadgeRowProps = { badgeKey: BadgeKey; appId: string }

const BadgeHistoryRow = ({ badgeKey, appId }: BadgeRowProps) => {
  const { t } = useTranslation()
  const config = BADGE_CONFIGS.find(b => b.key === badgeKey)!
  const { totalEarned, latestRank } = useBadgeStats(appId, badgeKey)

  return (
    <HStack gap={4} p={4} borderWidth="1px" rounded="xl">
      <Box border="2px dashed" borderColor="border.subtle" rounded="xl" p={1} flexShrink={0}>
        <Image src={config.image} alt={config.title} boxSize="56px" objectFit="contain" />
      </Box>
      <VStack align="flex-start" gap={0.5}>
        <Text textStyle="sm" fontWeight="semibold">
          {config.title}
        </Text>
        <HStack gap={4} flexWrap="wrap">
          <Text textStyle="xs" color="text.subtle">
            {t("Total Badges Earned")}
            {": "}
            {totalEarned}
          </Text>
          <Text textStyle="xs" color="text.subtle">
            {t("Latest Badges")}
            {": #"}
            {latestRank}
          </Text>
        </HStack>
      </VStack>
    </HStack>
  )
}

type Props = { isOpen: boolean; onClose: () => void; appId: string }

export const BadgeHistoryModal = ({ isOpen, onClose, appId }: Props) => {
  const { t } = useTranslation()

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} showCloseButton={false} isCloseable modalBodyProps={{ p: 0 }}>
      <VStack align="stretch" gap={0}>
        <HStack justify="space-between" align="center" p={6} pb={4}>
          <Heading size="md">{t("Badge History")}</Heading>
          <Box cursor="pointer" onClick={onClose}>
            <UilTimes size="20px" />
          </Box>
        </HStack>
        <VStack align="stretch" gap={3} px={6} pb={6}>
          {BADGE_CONFIGS.map(badge => (
            <BadgeHistoryRow key={badge.key} badgeKey={badge.key} appId={appId} />
          ))}
        </VStack>
      </VStack>
    </BaseModal>
  )
}
