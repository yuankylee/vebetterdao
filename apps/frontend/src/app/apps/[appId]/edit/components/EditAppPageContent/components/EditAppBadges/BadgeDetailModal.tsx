import { Box, HStack, Heading, Image, Switch, Text, VStack } from "@chakra-ui/react"
import { UilCheckCircle, UilClock, UilTimes } from "@iconscout/react-unicons"
import { UseFormReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { BadgeConfig } from "@/api/badges/badgeConfigs"
import { useAcquisitionRecords } from "@/api/badges/useAcquisitionRecords"
import { useBadgeStats } from "@/api/badges/useBadgeStats"
import { BaseModal } from "@/components/BaseModal"

import { EditAppForm } from "../../EditAppPageContent"

type Props = {
  isOpen: boolean
  onClose: () => void
  badge: BadgeConfig
  form: UseFormReturn<EditAppForm, any, EditAppForm>
  appId: string
}

export const BadgeDetailModal = ({ isOpen, onClose, badge, form, appId }: Props) => {
  const { t } = useTranslation()
  const { totalEarned, latestRank } = useBadgeStats(appId, badge.key)
  const { records } = useAcquisitionRecords(appId, badge.key)

  const badgeSettings = form.watch("badgeSettings")
  const isPrivate = badgeSettings?.[badge.key]?.isPrivate ?? false
  const isPublished = !isPrivate

  const handleToggle = (checked: boolean) => {
    const current = form.getValues("badgeSettings") ?? {}
    form.setValue("badgeSettings", { ...current, [badge.key]: { isPrivate: !checked } })
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} showCloseButton={false} isCloseable modalBodyProps={{ p: 0 }}>
      <VStack align="stretch" gap={0}>
        {/* Header */}
        <HStack justify="space-between" align="center" p={6} pb={4}>
          <HStack gap={3}>
            <Heading size="md">{t("Badges details")}</Heading>
            <HStack gap={2}>
              <Text textStyle="sm" fontWeight="semibold">
                {isPrivate ? t("Private") : t("Public")}
              </Text>
              <Switch.Root checked={!isPrivate} onCheckedChange={({ checked }) => handleToggle(checked)}>
                <Switch.HiddenInput />
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch.Root>
            </HStack>
          </HStack>
          <Box cursor="pointer" onClick={onClose}>
            <UilTimes size="20px" />
          </Box>
        </HStack>

        {/* Hero section */}
        <Box mx={6} mb={4} bg="#8B90CC" rounded="xl" p={5}>
          {/* Published/Unpublished pill — from API, independent of the switch */}
          <Box mb={3}>
            <HStack
              gap={1}
              display="inline-flex"
              bg={isPublished ? "rgba(255,255,255,0.9)" : "rgba(255,220,140,0.9)"}
              px={3}
              py={1}
              rounded="full">
              {isPublished ? <UilCheckCircle size="14px" color="#16a34a" /> : <UilClock size="14px" color="#d97706" />}
              <Text textStyle="xs" fontWeight="semibold" color={isPublished ? "green.700" : "orange.700"}>
                {isPublished ? t("Published") : t("Unpublished")}
              </Text>
            </HStack>
          </Box>

          <VStack align="center" gap={3} mb={4}>
            <Image src={badge.image} alt={badge.title} boxSize="90px" objectFit="contain" />
            <Text textStyle="lg" fontWeight="bold" color="white" textAlign="center">
              {badge.title}
            </Text>
            <Text textStyle="sm" color="whiteAlpha.900" textAlign="center">
              {badge.description}
            </Text>
          </VStack>

          {/* Stats */}
          <Box bg="rgba(0,0,0,0.2)" rounded="lg" p={4}>
            <HStack justify="space-around">
              <VStack gap={1} align="center">
                <Text textStyle="2xl" fontWeight="bold" color="white">
                  {totalEarned}
                </Text>
                <Text textStyle="xs" color="whiteAlpha.800" textAlign="center">
                  {t("Total Badges Earned")}
                </Text>
              </VStack>
              <VStack gap={1} align="center">
                <Text textStyle="2xl" fontWeight="bold" color="white">
                  {"#"}
                  {latestRank}
                </Text>
                <Text textStyle="xs" color="whiteAlpha.800" textAlign="center">
                  {t("Latest Badges")}
                </Text>
              </VStack>
            </HStack>
          </Box>
        </Box>

        {/* Acquisition Records */}
        <VStack align="stretch" gap={3} px={6} pb={6}>
          <Heading size="sm">{t("Acquisition Records")}</Heading>
          <VStack align="stretch" gap={0}>
            <HStack justify="space-between" pb={2} borderBottomWidth="1px">
              <Text textStyle="sm" fontWeight="bold" flex={1}>
                {t("Round")}
              </Text>
              <Text textStyle="sm" fontWeight="bold" flex={1}>
                {t("Ranking")}
              </Text>
              <Text textStyle="sm" fontWeight="bold" flex={1} textAlign="right">
                {t("Date")}
              </Text>
            </HStack>
            {records.map(record => (
              <HStack key={record.round} justify="space-between" py={2} borderBottomWidth="1px">
                <Text textStyle="sm" flex={1}>
                  {"# "}
                  {record.round}
                </Text>
                <Text textStyle="sm" flex={1}>
                  {record.ranking ?? t("Not Ranked")}
                </Text>
                <Text textStyle="sm" flex={1} textAlign="right">
                  {record.date}
                </Text>
              </HStack>
            ))}
          </VStack>
        </VStack>
      </VStack>
    </BaseModal>
  )
}
