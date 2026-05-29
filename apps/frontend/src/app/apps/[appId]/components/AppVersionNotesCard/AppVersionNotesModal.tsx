import { Box, CloseButton, HStack, Stack, Text } from "@chakra-ui/react"
import { useTranslation } from "react-i18next"

import { BaseModal } from "../../../../../components/BaseModal"

type VersionEntry = {
  version: string
  timestamp?: number
  notes?: string
}

type Props = {
  isOpen: boolean
  onClose: () => void
  versions: VersionEntry[]
}

const formatDate = (ts: number) =>
  new Date(ts).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })

export const AppVersionNotesModal = ({ isOpen, onClose, versions }: Props) => {
  const { t } = useTranslation()
  const reversed = [...versions].reverse()

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      modalContentProps={{ maxW: "600px" }}
      modalBodyProps={{ p: 6 }}>
      <Stack gap={5}>
        <HStack justify="space-between" align="center">
          <Text fontWeight="bold" fontSize="xl">
            {t("Version Update Details")}
          </Text>
          <CloseButton onClick={onClose} size="sm" />
        </HStack>

        <Stack gap={3}>
          {reversed.map((entry, idx) => (
            <Box key={idx} borderWidth={1} borderColor="gray.200" borderRadius="xl" p={4}>
              <Stack gap={1}>
                <Text fontWeight="bold">
                  {t("Version Number")}
                  {": "}
                  {entry.version}
                </Text>
                {entry.timestamp != null && (
                  <Text color="gray.500" fontSize="sm">
                    {formatDate(entry.timestamp)}
                  </Text>
                )}
                {entry.notes && (
                  <Text fontSize="sm" color="gray.700">
                    {entry.notes}
                  </Text>
                )}
              </Stack>
            </Box>
          ))}
        </Stack>
      </Stack>
    </BaseModal>
  )
}
