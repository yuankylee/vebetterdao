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
    <HStack gap={2} p={4} border="1px solid" bg={"#F9F9FA"} borderColor="#E7E9EB" rounded="xl" w="full">
      <Box flexShrink={0}>
        <Image src={config.image} alt={config.title} boxSize="61px" objectFit="contain" />
      </Box>
      <VStack align="flex-start" gap={0.5}>
        <Text textStyle="md" fontWeight="semibold">
          {config.title}
        </Text>
        <HStack gap={4} flexWrap="wrap">
          <Text textStyle="sm" color="text.subtle">
            {t("Total Badges Earned")}
            {": "}
            {totalEarned}
          </Text>
          <Text textStyle="sm" color="text.subtle">
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
        {BADGE_CONFIGS.map(badge => (
          <BadgeHistoryRow key={badge.key} badgeKey={badge.key} appId={appId} />
        ))}
      </VStack>
    </BaseModal>
  )
}
