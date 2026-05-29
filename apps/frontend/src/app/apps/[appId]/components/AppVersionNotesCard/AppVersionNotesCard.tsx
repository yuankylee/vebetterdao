import { Card, HStack, Skeleton, Stack, Text } from "@chakra-ui/react"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { useCurrentAppMetadata } from "../../hooks/useCurrentAppMetadata"

import { AppVersionNotesModal } from "./AppVersionNotesModal"

const formatDate = (ts: number) =>
  new Date(ts).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })

export const AppVersionNotesCard = () => {
  const { t } = useTranslation()
  const { appMetadata, appMetadataLoading } = useCurrentAppMetadata()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const versionHistory = appMetadata?.version_history ?? []
  const latestVersion = versionHistory.length > 0 ? versionHistory[versionHistory.length - 1] : null

  if (appMetadataLoading) {
    return (
      <Card.Root w="full" borderRadius="xl">
        <Card.Body p={4}>
          <Skeleton h="100px" borderRadius="md" />
        </Card.Body>
      </Card.Root>
    )
  }

  return (
    <>
      <AppVersionNotesModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} versions={versionHistory} />
      <Card.Root w="full" borderRadius="xl">
        <Card.Body p={4}>
          <Stack gap={3}>
            <HStack justify="space-between" align="center">
              <Text fontWeight="bold" fontSize="lg">
                {t("App Version Notes")}
              </Text>
              {versionHistory.length > 0 && (
                <Text
                  color="gray.500"
                  fontSize="sm"
                  cursor="pointer"
                  onClick={() => setIsModalOpen(true)}
                  _hover={{ color: "gray.700" }}>
                  {t("More ↗")}
                </Text>
              )}
            </HStack>

            {!latestVersion ? (
              <Text color="gray.500" fontSize="sm">
                {t(
                  "Add the app version number so users can stay informed about update content, resulting in a better user experience.",
                )}
              </Text>
            ) : (
              <Stack gap={1}>
                <Text fontWeight="bold">
                  {t("Version Number")}
                  {": "}
                  {latestVersion.version}
                </Text>
                {latestVersion.timestamp != null && (
                  <Text color="gray.500" fontSize="sm">
                    {formatDate(latestVersion.timestamp)}
                  </Text>
                )}
                <Text fontSize="sm">{latestVersion.notes}</Text>
              </Stack>
            )}
          </Stack>
        </Card.Body>
      </Card.Root>
    </>
  )
}
