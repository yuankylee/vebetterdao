import { Box, Button, Field, Heading, HStack, Text, Textarea, VStack } from "@chakra-ui/react"
import { UilTimes } from "@iconscout/react-unicons"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { BaseModal } from "@/components/BaseModal"

type Props = {
  isOpen: boolean
  onClose: () => void
  mode: "add" | "edit"
  version: string
  initialNotes?: string
  onSave: (notes: string) => void
}

type FormValues = { notes: string }

export const AppVersionNotesModal = ({ isOpen, onClose, mode, version, initialNotes = "", onSave }: Props) => {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { notes: initialNotes } })

  useEffect(() => {
    if (isOpen) reset({ notes: initialNotes })
  }, [isOpen, initialNotes, reset])

  const onSubmit = (data: FormValues) => onSave(data.notes)

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} modalContentProps={{ maxW: "682px" }} modalBodyProps={{ p: 6 }}>
      <HStack justify="space-between" align="center">
        <Heading size="xl">{t(mode === "add" ? "Add Version Notes" : "Edit Version Notes")}</Heading>
        <Box cursor="pointer" onClick={onClose} display={{ base: "none", lg: "block" }}>
          <UilTimes size="24px" />
        </Box>
      </HStack>
      <VStack
        gap={6}
        align="stretch"
        as="form"
        onSubmit={event => {
          event.preventDefault()
          event.stopPropagation()
          void handleSubmit(onSubmit)(event)
        }}>
        <VStack align="stretch" gap={3}>
          <Text textStyle="sm" color="text.subtle">
            {t(
              "Add the app version number so users can stay informed about update content, resulting in a better user experience.",
            )}
          </Text>
        </VStack>
        <VStack gap={3} align={"flex-start"}>
          <Text textStyle="md" fontWeight="semibold">
            {t("Version Number")}
            {": "}
            {version}
          </Text>

          <Field.Root invalid={!!errors.notes}>
            <Textarea
              placeholder={t("Please enter")}
              resize="none"
              h="160px"
              rounded="xl"
              {...register("notes", {
                required: t("Please enter"),
                maxLength: { value: 1000, message: t("Maximum 1000") },
              })}
            />
            <Field.ErrorText>{errors.notes?.message}</Field.ErrorText>
          </Field.Root>
        </VStack>

        <HStack justify="flex-end" gap={3}>
          <Button
            type="button"
            variant="subtle"
            colorPalette="blue"
            css={{
              backgroundColor: "#E6EEFF",
            }}
            borderRadius="full"
            px={10}
            onClick={onClose}>
            {t("Cancel")}
          </Button>
          <Button
            type="button"
            variant="primary"
            borderRadius="full"
            px={10}
            onClick={() => {
              void handleSubmit(onSubmit)()
            }}>
            {t("Save")}
          </Button>
        </HStack>
      </VStack>
    </BaseModal>
  )
}
