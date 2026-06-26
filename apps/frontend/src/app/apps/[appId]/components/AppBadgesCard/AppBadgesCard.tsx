import { Card, HStack, Heading, Link } from "@chakra-ui/react"
import { UilArrowUpRight } from "@iconscout/react-unicons"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { BADGE_CONFIGS, BadgeConfig } from "@/api/badges/badgeConfigs"
import { BadgeKey } from "@/api/badges/types"
import { usePreviousRoundBadges } from "@/api/badges/usePreviousRoundBadges"

import { AppBadgeDetailModal } from "./AppBadgeDetailModal"
import { BadgeHistoryModal } from "./BadgeHistoryModal"
import { BadgeIcon } from "./BadgeIcon"

type Props = { appId: string }

export const AppBadgesCard = ({ appId }: Props) => {
  const { t } = useTranslation()
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false)
  const [selectedBadge, setSelectedBadge] = useState<BadgeConfig>(BADGE_CONFIGS[0])

  const { badgesByKey, sortedKeys } = usePreviousRoundBadges(appId)

  const handleOpenBadge = (key: BadgeKey) => {
    const badge = BADGE_CONFIGS.find(b => b.key === key)
    if (badge) setSelectedBadge(badge)
    setIsBadgeModalOpen(true)
  }

  return (
    <>
      <Card.Root variant="outline" w="full" h="full">
        <Card.Body p={4}>
          <HStack justify="space-between" align="center" mb={4}>
            <Heading size="md">{t("App Badges")}</Heading>
            <Link
              textStyle="md"
              fontWeight="normal"
              color="actions.secondary.text-lighter"
              onClick={() => setIsHistoryOpen(true)}>
              {t("More")}
              <UilArrowUpRight />
            </Link>
          </HStack>

          <HStack gap={3} flexWrap="wrap">
            {sortedKeys.map(key => (
              <BadgeIcon
                key={key}
                badgeKey={key}
                earned={badgesByKey[key].earned}
                rank={badgesByKey[key].rank}
                onClick={() => handleOpenBadge(key)}
              />
            ))}
          </HStack>
        </Card.Body>
      </Card.Root>

      <BadgeHistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} appId={appId} />
      <AppBadgeDetailModal
        isOpen={isBadgeModalOpen}
        onClose={() => setIsBadgeModalOpen(false)}
        badge={selectedBadge}
        appId={appId}
      />
    </>
  )
}
