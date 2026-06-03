import { Box, Card, HStack, Heading, Image, Text, VStack } from "@chakra-ui/react"
import { UilAngleRight, UilCheckCircle, UilClock } from "@iconscout/react-unicons"
import { useParams } from "next/navigation"
import { useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { BADGE_CONFIGS, BadgeConfig } from "@/api/badges/badgeConfigs"
import { BadgeKey } from "@/api/badges/types"
import { useBadgeStatus } from "@/api/badges/useBadgeStatus"

import { EditAppForm } from "../../EditAppPageContent"

import { BadgeDetailModal } from "./BadgeDetailModal"

type BadgeRowProps = {
  badge: BadgeConfig
  appId: string
  onClick: () => void
}

const BadgeRow = ({ badge, appId, onClick }: BadgeRowProps) => {
  const { t } = useTranslation()
  const { isPublished, isLoading } = useBadgeStatus(appId, badge.key as BadgeKey)

  return (
    <HStack
      gap={3}
      p={3}
      borderWidth="1px"
      rounded="xl"
      cursor="pointer"
      onClick={onClick}
      _hover={{ bg: "bg.muted" }}
      transition="background 0.15s">
      {/* Badge image with dashed border */}
      <Box border="2px dashed" borderColor="border.subtle" rounded="xl" p={1} flexShrink={0}>
        <Image src={badge.image} alt={badge.title} boxSize="52px" objectFit="contain" />
      </Box>

      <VStack align="flex-start" gap={1} flex={1} minW={0}>
        <Text textStyle="sm" fontWeight="semibold" truncate>
          {badge.title}
        </Text>
        {!isLoading && (
          <HStack gap={1}>
            <Box
              display="inline-flex"
              alignItems="center"
              gap={1}
              bg={isPublished ? "green.subtle" : "orange.subtle"}
              px={2}
              py={0.5}
              rounded="full">
              {isPublished ? <UilCheckCircle size="12px" color="#16a34a" /> : <UilClock size="12px" color="#d97706" />}
              <Text textStyle="xs" fontWeight="semibold" color={isPublished ? "green.700" : "orange.700"}>
                {isPublished ? t("Published") : t("Unpublished")}
              </Text>
            </Box>
          </HStack>
        )}
      </VStack>

      <UilAngleRight size="20px" />
    </HStack>
  )
}

type Props = { form: UseFormReturn<EditAppForm, any, EditAppForm> }

export const EditAppBadges = ({ form }: Props) => {
  const { t } = useTranslation()
  const { appId } = useParams<{ appId: string }>()
  const [openBadgeKey, setOpenBadgeKey] = useState<BadgeKey | null>(null)

  // Keep last selected badge in a stable ref so modal content doesn't disappear during close animation
  const openBadge = BADGE_CONFIGS.find(b => b.key === openBadgeKey) ?? BADGE_CONFIGS[0]

  return (
    <>
      <Card.Root variant="outline" w="full">
        <Card.Body>
          <VStack align="stretch" gap={4}>
            <VStack align="flex-start" gap={1}>
              <Heading size="md">{t("My Badges")}</Heading>
              <Text textStyle="sm" color="text.subtle">
                {t(
                  "Enable public badges. When the dApp receives a badge, it will be automatically displayed to users publicly. (Only the badges obtained in the last round can be displayed.)",
                )}
              </Text>
            </VStack>

            <VStack align="stretch" gap={3}>
              {BADGE_CONFIGS.map(badge => (
                <BadgeRow key={badge.key} badge={badge} appId={appId} onClick={() => setOpenBadgeKey(badge.key)} />
              ))}
            </VStack>
          </VStack>
        </Card.Body>
      </Card.Root>

      <BadgeDetailModal
        isOpen={!!openBadgeKey}
        onClose={() => setOpenBadgeKey(null)}
        badge={openBadge}
        form={form}
        appId={appId}
      />
    </>
  )
}
