import { Card, HStack, Link, Separator, Skeleton, Stack, Text } from "@chakra-ui/react"
import { UilArrowUpRight } from "@iconscout/react-unicons"
import dayjs from "dayjs"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { useCurrentAppMetadata } from "../../hooks/useCurrentAppMetadata"

import { AppVersionNotesModal } from "./AppVersionNotesModal"

const CARD_VERSION_COUNT = 1

export const AppVersionNotesCard = () => {
  const { t } = useTranslation()
  const { appMetadata, appMetadataLoading } = useCurrentAppMetadata()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const versionHistory = appMetadata?.version_history ?? []
  const displayedVersions = [...versionHistory].reverse().slice(0, CARD_VERSION_COUNT)

  if (versionHistory.length == 0) return null

  if (appMetadataLoading) {
    return (
      <Card.Root w="full" borderRadius="xl">
        <Card.Body p={0}>
          <Skeleton h="100px" borderRadius="md" />
        </Card.Body>
      </Card.Root>
    )
  }

  return (
    <>
      <AppVersionNotesModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} versions={versionHistory} />
      <Card.Root w="full" borderRadius="xl">
        <Card.Body p={0}>
          <Stack gap={3}>
            <Stack gap={2}>
              <HStack justify="space-between" align="center">
                <Text fontWeight="700" fontSize="xl">
                  {t("App Version Notes")}
                </Text>
                {versionHistory.length > CARD_VERSION_COUNT && (
                  <Link
                    textStyle="md"
                    fontWeight="normal"
                    color="actions.secondary.text-lighter"
                    onClick={() => setIsModalOpen(true)}>
                    {t("More")}
                    <UilArrowUpRight />
                  </Link>
                )}
              </HStack>
            </Stack>

            {displayedVersions.length > 0 && (
              <Stack gap={0} mt={3}>
                {displayedVersions.map((entry, index) => (
                  <Stack key={entry.version} gap={1}>
                    {index > 0 && <Separator my={3} />}
                    <Text fontWeight="600" fontSize="md">
                      {t("Version Number")}
                      {": "}
                      {entry.version}
                    </Text>
                    {entry.timestamp != null && (
                      <Text color="gray.500" fontSize="sm">
                        {dayjs(Number(entry.timestamp)).format("MMM D, YYYY")}
                      </Text>
                    )}
                    <Text fontSize="sm" whiteSpace="pre-wrap" wordBreak="break-word">
                      {entry.notes}
                    </Text>
                  </Stack>
                ))}
              </Stack>
            )}
          </Stack>
        </Card.Body>
      </Card.Root>
    </>
  )
}
