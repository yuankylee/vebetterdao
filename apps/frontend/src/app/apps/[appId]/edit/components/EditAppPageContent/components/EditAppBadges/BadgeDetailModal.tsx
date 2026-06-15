import { Box, HStack, Heading, Image, SimpleGrid, Skeleton, Switch, Text, VStack } from "@chakra-ui/react"
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
  const { totalEarned, latestRank, isLoading: isStatsLoading } = useBadgeStats(appId, badge.key, { enabled: isOpen })
  const { records, isLoading: isRecordsLoading } = useAcquisitionRecords(appId, badge.key, { enabled: isOpen })
  const isLoading = isStatsLoading || isRecordsLoading

  const badgeSettings = form.watch("badgeSettings")
  const isPrivate = badgeSettings?.[badge.key]?.isPrivate ?? false
  const isPublished = !isPrivate

  const handleToggle = (checked: boolean) => {
    const current = form.getValues("badgeSettings") ?? {}
    form.setValue("badgeSettings", { ...current, [badge.key]: { isPrivate: !checked } })
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} isCloseable modalBodyProps={{ p: 0 }}>
      <VStack align="stretch" gap={0}>
        {/* Header */}
        <HStack justify="space-between" align="center" p={{ base: 2, sm: 6 }} pb={4}>
          <HStack gap={3} w={{ base: "full", md: "auto" }} justify={{ base: "space-between", md: "flex-start" }}>
            <Heading size="xl">{t("Badges details")}</Heading>
            <HStack gap={2}>
              <Switch.Root checked={!isPrivate} onCheckedChange={({ checked }) => handleToggle(checked)}>
                <Switch.HiddenInput />
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch.Root>
              <Text textStyle="sm" fontWeight="semibold">
                {isPrivate ? t("Private") : t("Public")}
              </Text>
            </HStack>
          </HStack>
          <Box cursor="pointer" onClick={onClose} display={{ base: "none", md: "flex" }}>
            <UilTimes size="24px" />
          </Box>
        </HStack>

        {/* Hero section */}
        <Box
          mx={{ base: 2, sm: 6 }}
          mb={4}
          bg="linear-gradient(180deg, #9BBBF9 0%, #82A6F7 100%)"
          rounded="xl"
          p={5}
          position="relative">
          {/* Published/Unpublished pill — from API, independent of the switch */}
          <Box mb={3} position="absolute" zIndex={9}>
            <HStack gap={1} display="inline-flex" bg={isPublished ? "#E9FDF1" : "#FFF3E5"} px={2} py={1} rounded="full">
              {isPublished ? <UilCheckCircle size="16px" color="#3DBA67" /> : <UilClock size="16px" color="#FFB566" />}
              <Text textStyle="xs" fontWeight="semibold" color={isPublished ? "#3DBA67" : "#FFB566"}>
                {isPublished ? t("Published") : t("Unpublished")}
              </Text>
            </HStack>
          </Box>

          <VStack align="center" gap={0} mb={4} mt={-5}>
            <VStack align="center" w="170px" h="170px" position="relative">
              <Image src={badge.imageBg} alt={badge.title} boxSize="170px" position="absolute" objectFit="contain" />
              <Image
                src={badge.image}
                alt={badge.title}
                boxSize="140px"
                top={4}
                left={"12px"}
                position="absolute"
                zIndex={2}
                objectFit="contain"
              />
            </VStack>

            <VStack gap={3}>
              <Text textStyle="lg" fontWeight="bold" color="white" textAlign="center">
                {badge.title}
              </Text>
              <Text textStyle="sm" color="whiteAlpha.900" textAlign="center">
                {badge.description}
              </Text>
            </VStack>
          </VStack>

          {/* Stats */}
          <Box
            bg={{ base: "transparent", md: "rgba(255,255,255,0.2)" }}
            rounded={{ base: "none", md: "lg" }}
            p={{ base: 0, md: 4 }}>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
              <HStack
                gap={2}
                align="center"
                justify="center"
                bg={{ base: "rgba(255,255,255,0.2)", md: "transparent" }}
                rounded={{ base: "lg", md: "none" }}
                p={{ base: 4, md: 0 }}>
                <Image src="/assets/images/badges/badge-left.webp" alt="" w="20px" h="36px" objectFit="contain" />
                <VStack gap={1} align="center">
                  <Skeleton loading={isLoading}>
                    <Text textStyle="2xl" fontWeight="bold" color="white">
                      {totalEarned}
                    </Text>
                  </Skeleton>
                  <Text textStyle="xs" color="whiteAlpha.800" textAlign="center">
                    {t("Total Badges Earned")}
                  </Text>
                </VStack>
                <Image src="/assets/images/badges/badge-right.webp" alt="" w="20px" h="36px" objectFit="contain" />
              </HStack>
              <HStack
                gap={2}
                align="center"
                justify="center"
                bg={{ base: "rgba(255,255,255,0.2)", md: "transparent" }}
                rounded={{ base: "lg", md: "none" }}
                p={{ base: 4, md: 0 }}>
                <Image src="/assets/images/badges/badge-left.webp" alt="" w="20px" h="36px" objectFit="contain" />
                <VStack gap={1} align="center">
                  <Skeleton loading={isLoading}>
                    <Text textStyle="2xl" fontWeight="bold" color="white">
                      {latestRank != null ? `#${latestRank}` : "-"}
                    </Text>
                  </Skeleton>
                  <Text textStyle="xs" color="whiteAlpha.800" textAlign="center">
                    {t("Latest Badges")}
                  </Text>
                </VStack>
                <Image src="/assets/images/badges/badge-right.webp" alt="" w="20px" h="36px" objectFit="contain" />
              </HStack>
            </SimpleGrid>
          </Box>
        </Box>

        {/* Acquisition Records */}
        <VStack justify="space-between" align="center" px={{ base: 2, sm: 6 }}>
          <Box w="full" borderRadius="12px" gap={3} p={{ base: 2, sm: 4 }} pb={6} bg={"#F9F9FA"}>
            <Heading size="sm" mb={4}>
              {t("Acquisition Records")}
            </Heading>
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
              {isLoading ? (
                <Skeleton h="80px" borderRadius="md" />
              ) : records.length === 0 ? (
                <Text textStyle="sm" color="text.subtle">
                  {t("No rounds available")}
                </Text>
              ) : (
                records.map(record => (
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
                ))
              )}
            </VStack>
          </Box>
        </VStack>
      </VStack>
    </BaseModal>
  )
}
