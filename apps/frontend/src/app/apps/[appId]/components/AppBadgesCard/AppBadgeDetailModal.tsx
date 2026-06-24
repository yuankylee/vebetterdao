"use client"

import { Box, HStack, Heading, Image, SimpleGrid, Skeleton, Text, VStack } from "@chakra-ui/react"
import { UilTimes } from "@iconscout/react-unicons"
import { useTranslation } from "react-i18next"

import { BadgeConfig } from "@/api/badges/badgeConfigs"
import { useBadgeRoundRank } from "@/api/badges/useBadgeRoundRank"
import { BaseModal } from "@/components/BaseModal"

type Props = {
  isOpen: boolean
  onClose: () => void
  badge: BadgeConfig
  appId: string
}

export const AppBadgeDetailModal = ({ isOpen, onClose, badge, appId }: Props) => {
  const { t } = useTranslation()
  const { totalEarned, latestRank, isLoading, rank } = useBadgeRoundRank(appId, badge.key, { enabled: isOpen })

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} isCloseable modalBodyProps={{ p: 0 }}>
      <VStack align="stretch" gap={0}>
        <HStack justify="space-between" align="center" p={{ base: 2, sm: 6 }} pb={4}>
          <Heading size="xl">{t("Badges details")}</Heading>
          <Box cursor="pointer" onClick={onClose} display={{ base: "none", md: "flex" }}>
            <UilTimes size="24px" />
          </Box>
        </HStack>

        <Box
          mx={{ base: 2, sm: 6 }}
          mb={{ base: 2, sm: 6 }}
          bg="linear-gradient(180deg, #9BBBF9 0%, #82A6F7 100%)"
          rounded="xl"
          pt={0}
          pb={5}
          px={5}>
          <VStack align="center" gap={0} mb={4}>
            <VStack align="center" w="170px" h="170px" position="relative">
              <Image src={badge.imageBg} alt={badge.title} boxSize="170px" position="absolute" objectFit="contain" />
              <Box position="absolute" top={4} left="12px" w="140px" h="140px" zIndex={2}>
                <Image src={badge.image} alt={badge.title} w="full" h="full" objectFit="contain" />
                {rank > 0 && (
                  <Box
                    position="absolute"
                    bottom="16px"
                    left="50%"
                    transform="translateX(-50%)"
                    color="white"
                    textStyle="md"
                    fontWeight="bold"
                    lineHeight="1"
                    whiteSpace="nowrap">
                    {rank}
                  </Box>
                )}
              </Box>
            </VStack>

            <VStack gap={3}>
              <Text textStyle="lg" fontWeight="bold" color="white" textAlign="center">
                {badge.title}
              </Text>
              <Text textStyle="sm" color="whiteAlpha.900" textAlign="center">
                {t(badge.description)}
              </Text>
            </VStack>
          </VStack>

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
      </VStack>
    </BaseModal>
  )
}
