"use client"

import { Box, Heading, HStack, Image, SimpleGrid, Skeleton, Text, VStack } from "@chakra-ui/react"
import { UilTimes } from "@iconscout/react-unicons"
import { useTranslation } from "react-i18next"

import { BaseModal } from "@/components/BaseModal"
import { ExpandableImage } from "@/components/ExpandableImage"
import { convertUriToUrl } from "@/utils/uri"

import { useCurrentAppLogo } from "../../../hooks/useCurrentAppLogo"
import { useCurrentAppMetadata } from "../../../hooks/useCurrentAppMetadata"

const notFoundImage = "/assets/images/image-not-found.webp"

const safeConvertUri = (url: string): string => {
  try {
    return convertUriToUrl(url)
  } catch {
    return url
  }
}

const SectionPanel = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Box bg="#F9F9FA" rounded="xl" p={{ base: 4, md: 5 }} w="full">
    <Heading size="md" mb={4}>
      {title}
    </Heading>
    {children}
  </Box>
)

type MoreAppDetailsModalProps = {
  isOpen: boolean
  onClose: () => void
}

export const MoreAppDetailsModal = ({ isOpen, onClose }: MoreAppDetailsModalProps) => {
  const { t } = useTranslation()
  const { appMetadata, appMetadataLoading } = useCurrentAppMetadata()
  const { logo, isLogoLoading } = useCurrentAppLogo()

  const more = appMetadata?.more_details
  const partners = more?.ecosystem_partners ?? []
  const team = more?.team_background ?? []
  const roadmap = more?.app_roadmap
  const moreDetailsEnabled = appMetadata?.more_details_enabled ?? false

  const hasTeamMemberContent = (m: { photo?: string; title?: string; description?: string }) =>
    Boolean((m.title ?? "").trim() || (m.description ?? "").trim() || (m.photo ?? "").trim())

  const teamToShow = team.filter(hasTeamMemberContent)
  const logoSrc = logo ? safeConvertUri(logo) : notFoundImage
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      isCloseable
      modalContentProps={{ maxW: "821px" }}
      modalBodyProps={{ p: 6 }}>
      <HStack justify="space-between" align="center">
        <Heading size="xl">{t("More App Details")}</Heading>
        <Box cursor="pointer" onClick={onClose} display={{ base: "none", lg: "block" }}>
          <UilTimes size="24px" />
        </Box>
      </HStack>
      <VStack gap={4} align="stretch" w="full" mt={6} maxH="80vh" overflowY="auto">
        <HStack gap={4} align="flex-start" w="full">
          <Skeleton loading={isLogoLoading} boxSize="48px" borderRadius="12px" flexShrink={0}>
            <Image src={logoSrc} alt="" boxSize="48px" borderRadius="12px" objectFit="cover" />
          </Skeleton>
          <VStack align="flex-start" gap={3} flex={1} minW={0}>
            <Skeleton loading={appMetadataLoading && !!appMetadata} w="full">
              <Heading size="3xl">{appMetadata?.name ?? ""}</Heading>
            </Skeleton>
          </VStack>
        </HStack>
        <Skeleton loading={appMetadataLoading && !!appMetadata} w="full">
          <Text textStyle="sm" as="span" wordBreak="break-word" whiteSpace="pre-wrap">
            {appMetadata?.description ?? ""}
          </Text>
        </Skeleton>
        <VStack align="stretch" gap={4} w="full">
          {moreDetailsEnabled && partners.length > 0 && (
            <SectionPanel title={t("Ecosystem Partners")}>
              <HStack gap={3} overflowX="auto" pb={1} align="stretch">
                {partners.map((url, index) => (
                  <Image
                    key={url}
                    src={safeConvertUri(url)}
                    alt={`${t("Ecosystem partner logo")} ${index + 1}`}
                    w="100px"
                    h="100px"
                    minW="100px"
                    objectFit="contain"
                    borderRadius="lg"
                    bg="white"
                    p={2}
                  />
                ))}
              </HStack>
            </SectionPanel>
          )}

          {moreDetailsEnabled && teamToShow.length > 0 && (
            <SectionPanel title={t("Team Background")}>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} w="full">
                {teamToShow.map(member => {
                  const photoUrl = member.photo ? safeConvertUri(member.photo) : null
                  const memberKey = [member.title, member.photo ?? "", member.description ?? ""].join("\u0001")
                  return (
                    <Box key={memberKey} bg="white" borderRadius="xl" p={4}>
                      <VStack gap={2} align="flex-start">
                        <Box w="full" h="88px" borderRadius="xl" overflow="hidden" flexShrink={0} bg="bg.tertiary">
                          {photoUrl ? (
                            <ExpandableImage
                              src={photoUrl}
                              alt=""
                              thumbnailProps={{ w: "full", h: "full", objectFit: "cover" }}
                            />
                          ) : null}
                        </Box>
                        <Heading size="md" fontWeight="600">
                          {member.title}
                        </Heading>
                        <Text textStyle="sm" color="text.subtle" whiteSpace="pre-wrap" wordBreak="break-word">
                          {member.description}
                        </Text>
                      </VStack>
                    </Box>
                  )
                })}
              </SimpleGrid>
            </SectionPanel>
          )}

          {moreDetailsEnabled && (roadmap?.image || (roadmap?.description ?? "").trim()) && (
            <SectionPanel title={t("App Roadmap")}>
              <VStack align="stretch" gap={4} w="full">
                {roadmap?.image ? (
                  <Image
                    src={safeConvertUri(roadmap.image)}
                    alt={t("App Roadmap")}
                    w="full"
                    maxH="420px"
                    objectFit="contain"
                    borderRadius="lg"
                    bg="white"
                  />
                ) : null}
                {(roadmap?.description ?? "").trim() ? (
                  <Text textStyle="sm" color="text.subtle" whiteSpace="pre-wrap" wordBreak="break-word">
                    {roadmap?.description}
                  </Text>
                ) : null}
              </VStack>
            </SectionPanel>
          )}
        </VStack>
      </VStack>
    </BaseModal>
  )
}
