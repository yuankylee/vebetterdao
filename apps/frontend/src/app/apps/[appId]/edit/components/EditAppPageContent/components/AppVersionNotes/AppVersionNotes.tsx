import { Button, Card, HStack, Separator, Text, VStack } from "@chakra-ui/react"
import { UilPlus } from "@iconscout/react-unicons"
import dayjs from "dayjs"
import { useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { EditAppForm } from "../EditAppPageContent"

import { AppVersionNotesModal } from "./AppVersionNotesModal"

const MAX_DISPLAYED_VERSIONS = 5

const incrementVersion = (v: string): string => {
  const parts = v.replace("V", "").split(".")
  const major = parseInt(parts[0] ?? "1", 10)
  const minor = parseInt(parts[1] ?? "0", 10)
  return `V${major}.${minor + 1}`
}

type ModalState = { mode: "add" | "edit"; version: string; initialNotes: string }

type Props = {
  form: UseFormReturn<EditAppForm>
}

export const AppVersionNotes = ({ form }: Props) => {
  const { t } = useTranslation()
  const [modalState, setModalState] = useState<ModalState | null>(null)
  const { watch, setValue } = form
  const versionHistory = watch("versionHistory")

  const displayedVersions = [...versionHistory].reverse().slice(0, MAX_DISPLAYED_VERSIONS)
  const latestEntry = versionHistory.at(-1)
  const nextVersion = latestEntry ? incrementVersion(latestEntry.version) : "V1.0"

  const openAdd = () => setModalState({ mode: "add", version: nextVersion, initialNotes: "" })
  const openEdit = () => {
    if (!latestEntry) return
    setModalState({ mode: "edit", version: latestEntry.version, initialNotes: latestEntry.notes })
  }

  const handleSave = (notes: string) => {
    if (!modalState) return

    const updatedHistory =
      modalState.mode === "add"
        ? [...versionHistory, { version: modalState.version, notes, timestamp: Date.now() }]
        : versionHistory.map((entry, i) => (i === versionHistory.length - 1 ? { ...entry, notes } : entry))

    setValue("versionHistory", updatedHistory, { shouldDirty: true })
    setModalState(null)
  }

  return (
    <>
      <Card.Root variant="outline" w="full">
        <Card.Body>
          <VStack align="stretch" gap={5}>
            <VStack align="stretch" gap={1}>
              <Text textStyle="md" fontWeight="600">
                {t("App Version Notes")}
              </Text>
              <Text textStyle="sm" color="text.subtle">
                {t(
                  "Add the app version number so users can stay informed about update content, resulting in a better user experience.",
                )}
              </Text>
            </VStack>

            {displayedVersions.length > 0 ? (
              <VStack align="stretch" gap={0} maxH={"320px"} overflowX="auto">
                {displayedVersions.map((entry, index) => {
                  const isLatest = index === 0
                  return (
                    <VStack key={entry.version} align="stretch" gap={0}>
                      {index > 0 && <Separator my={4} />}
                      <HStack justify="space-between" align="flex-start">
                        <Text textStyle="md" fontWeight="bold">
                          {t("Version Number")}
                          {": "}
                          {entry.version}
                        </Text>
                        {isLatest && (
                          <Button variant="link" size="sm" onClick={openEdit} color="brand.primary" flexShrink={0}>
                            {t("Edit")}
                          </Button>
                        )}
                      </HStack>
                      {entry.timestamp && (
                        <Text textStyle="sm" color="text.subtle" mt={1}>
                          {dayjs(Number(entry.timestamp)).format("MMM D, YYYY")}
                        </Text>
                      )}
                      <Text textStyle="sm" color="text.default" mt={2} wordBreak="break-word" whiteSpace="pre-wrap">
                        {entry.notes}
                      </Text>
                    </VStack>
                  )
                })}
              </VStack>
            ) : null}

            <Button
              colorPalette={"blue"}
              variant="outline"
              w="full"
              rounded="full"
              onClick={openAdd}
              css={{
                _icon: {
                  width: "4",
                  height: "4",
                },
              }}>
              <UilPlus />
              {t("Add")}
            </Button>
          </VStack>
        </Card.Body>
      </Card.Root>

      <AppVersionNotesModal
        isOpen={!!modalState}
        onClose={() => setModalState(null)}
        mode={modalState?.mode ?? "add"}
        version={modalState?.version ?? nextVersion}
        initialNotes={modalState?.initialNotes ?? ""}
        onSave={handleSave}
      />
    </>
  )
}
