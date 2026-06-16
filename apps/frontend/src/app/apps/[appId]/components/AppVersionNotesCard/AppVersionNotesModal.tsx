import { Box, Heading, HStack, Stack, Text } from "@chakra-ui/react"
import { UilTimes } from "@iconscout/react-unicons"
import dayjs from "dayjs"
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

export const AppVersionNotesModal = ({ isOpen, onClose, versions }: Props) => {
  const { t } = useTranslation()
  const reversed = [...versions].reverse()

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      isCloseable
      modalContentProps={{ maxW: "682px" }}
      modalBodyProps={{ p: 6 }}>
      <HStack justify="space-between" align="center" pb={6}>
        <Heading size="xl">{t("Version Update Details")}</Heading>
        <Box cursor="pointer" onClick={onClose} display={{ base: "none", lg: "block" }}>
          <UilTimes size="24px" />
        </Box>
      </HStack>
      <Stack gap={3}>
        <Stack gap={3}>
          {reversed.map((entry, idx) => (
            <Box key={idx} borderWidth={1} borderColor="gray.200" bg={"#F9F9FA"} borderRadius="xl" p={4}>
              <Stack gap={1}>
                <Text fontWeight="bold" fontStyle="sm">
                  {t("Version Number")}
                  {": "}
                  {entry.version}
                </Text>
                {entry.timestamp != null && (
                  <Text color="gray.700" fontSize="sm">
                    {dayjs(Number(entry.timestamp)).format("MMM D, YYYY")}
                  </Text>
                )}
                {entry.notes && (
                  <Text color="gray.700" fontSize="sm">
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
