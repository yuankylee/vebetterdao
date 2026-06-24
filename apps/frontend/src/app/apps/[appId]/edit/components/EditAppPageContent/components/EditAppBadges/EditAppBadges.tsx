import { Box, Card, HStack, Heading, Image, Text, VStack } from "@chakra-ui/react"
import { UilAngleRight, UilCheckCircle, UilClock } from "@iconscout/react-unicons"
import { useParams } from "next/navigation"
import { useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { BADGE_CONFIGS, BadgeConfig } from "@/api/badges/badgeConfigs"
import { BadgeKey } from "@/api/badges/types"

import { EditAppForm } from "../../EditAppPageContent"

import { BadgeDetailModal } from "./BadgeDetailModal"

type BadgeRowProps = {
  badge: BadgeConfig
  form: UseFormReturn<EditAppForm, any, EditAppForm>
  onClick: () => void
}

const BadgeRow = ({ badge, form, onClick }: BadgeRowProps) => {
  const { t } = useTranslation()
  const badgeSettings = form.watch("badgeSettings")
  const isPrivate = badgeSettings?.[badge.key]?.isPrivate ?? false
  const isPublished = !isPrivate

  return (
    <HStack
      gap={1}
      p={2}
      css={{
        bg: "#F9F9FA",
        border: "1px solid #E7E9EB",
      }}
      borderWidth="1px"
      rounded="xl"
      cursor="pointer"
      onClick={onClick}
      _hover={{ bg: "bg.muted" }}
      transition="background 0.15s">
      {/* Badge image with dashed border */}
      <Box border="2px dashed" borderColor="border.subtle" rounded="xl" p={1} flexShrink={0}>
        <Image src={badge.image} alt={t(badge.title)} boxSize="64px" objectFit="contain" />
      </Box>

      <VStack align="flex-start" gap={1} flex={1} minW={0}>
        <Text
          textStyle="md"
          fontWeight="semibold"
          color={"#272A2E"}
          truncate
          css={{
            marginBottom: "0.1rem",
          }}>
          {t(badge.title)}
        </Text>
        <HStack gap={1}>
          <Box
            display="inline-flex"
            alignItems="center"
            gap={1}
            bg={isPublished ? "#E9FDF1" : "#FFF3E5"}
            px={2}
            py={1}
            rounded="full">
            {isPublished ? <UilCheckCircle size="16px" color="#3DBA67" /> : <UilClock size="16px" color="#FFB566" />}
            <Text textStyle="xs" fontWeight="semibold" color={isPublished ? "#3DBA67" : "#FFB566"}>
              {isPublished ? t("Published") : t("Unpublished")}
            </Text>
          </Box>
        </HStack>
      </VStack>

      <UilAngleRight size="28px" />
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
              <Heading textStyle="md" fontWeight="600">
                {t("My Badges")}
              </Heading>
              <Text textStyle="sm" color="text.subtle">
                {t(
                  "Enable public badges. When the dApp receives a badge, it will be automatically displayed to users publicly. (Only the badges obtained in the last round can be displayed.)",
                )}
              </Text>
            </VStack>

            <VStack align="stretch" gap={3}>
              {BADGE_CONFIGS.map(badge => (
                <BadgeRow key={badge.key} badge={badge} form={form} onClick={() => setOpenBadgeKey(badge.key)} />
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
