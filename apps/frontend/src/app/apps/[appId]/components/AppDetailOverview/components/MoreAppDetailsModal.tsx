"use client"

import { Box, Heading, HStack, Image, SimpleGrid, Skeleton, Text, VStack } from "@chakra-ui/react"
import { useTranslation } from "react-i18next"

import { BaseModal } from "@/components/BaseModal"
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

  const hasTeamMemberContent = (m: { photo?: string; title?: string; description?: string }) =>
    Boolean((m.title ?? "").trim() || (m.description ?? "").trim() || (m.photo ?? "").trim())

  const teamToShow = team.filter(hasTeamMemberContent)
  const logoSrc = logo ? safeConvertUri(logo) : notFoundImage

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      ariaTitle={t("More App Details")}
      showCloseButton
      modalProps={{ size: "4xl" }}
      modalContentProps={{ minW: "1000px", maxW: "min(100vw - 32px, 1200px)" }}>
      <VStack gap={8} align="stretch" w="full">
        <Heading size="2xl">{t("More App Details")}</Heading>

        <HStack gap={4} align="flex-start" w="full" flexWrap={{ base: "wrap", md: "nowrap" }}>
          <Skeleton loading={isLogoLoading} boxSize="64px" borderRadius="16px" flexShrink={0}>
            <Image src={logoSrc} alt="" boxSize="64px" borderRadius="16px" objectFit="cover" />
          </Skeleton>
          <VStack align="flex-start" gap={3} flex={1} minW={0}>
            <Skeleton loading={appMetadataLoading && !!appMetadata} w="full">
              <Heading size="3xl">{appMetadata?.name ?? ""}</Heading>
            </Skeleton>
            <Skeleton loading={appMetadataLoading && !!appMetadata} w="full">
              <Text textStyle="md" color="text.subtle" whiteSpace="pre-wrap">
                {appMetadata?.description ?? ""}
              </Text>
            </Skeleton>
          </VStack>
        </HStack>

        <VStack align="stretch" gap={6} w="full">
          <SectionPanel title={t("Ecosystem Partners")}>
            {partners.length > 0 ? (
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
            ) : (
              <Text textStyle="sm" color="text.subtle">
                {t("No ecosystem partners to display")}
              </Text>
            )}
          </SectionPanel>

          <SectionPanel title={t("Team Background")}>
            {teamToShow.length > 0 ? (
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} w="full">
                {teamToShow.map(member => {
                  const photoUrl = member.photo ? safeConvertUri(member.photo) : null
                  const memberKey = [member.title, member.photo ?? "", member.description ?? ""].join("\u0001")
                  return (
                    <Box key={memberKey} bg="white" borderRadius="xl" p={4}>
                      <HStack gap={3} align="flex-start" mb={3}>
                        <Box w="48px" h="48px" borderRadius="full" overflow="hidden" flexShrink={0} bg="bg.tertiary">
                          {photoUrl ? <Image src={photoUrl} alt="" w="full" h="full" objectFit="cover" /> : null}
                        </Box>
                        <Heading size="sm">{member.title}</Heading>
                      </HStack>
                      <Text textStyle="sm" color="text.subtle" whiteSpace="pre-wrap">
                        {member.description}
                      </Text>
                    </Box>
                  )
                })}
              </SimpleGrid>
            ) : (
              <Text textStyle="sm" color="text.subtle">
                {t("No team background to display")}
              </Text>
            )}
          </SectionPanel>

          <SectionPanel title={t("App Roadmap")}>
            {roadmap?.image || (roadmap?.description ?? "").trim() ? (
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
                  <Text textStyle="md" color="text.subtle" whiteSpace="pre-wrap">
                    {roadmap?.description}
                  </Text>
                ) : null}
              </VStack>
            ) : (
              <Text textStyle="sm" color="text.subtle">
                {t("No app roadmap to display")}
              </Text>
            )}
          </SectionPanel>
        </VStack>
      </VStack>
    </BaseModal>
  )
}
