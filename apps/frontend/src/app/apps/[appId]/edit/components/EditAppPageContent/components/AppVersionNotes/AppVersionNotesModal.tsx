import { Button, Field, HStack, Text, Textarea, VStack } from "@chakra-ui/react"
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
  isSaving: boolean
}

type FormValues = { notes: string }

export const AppVersionNotesModal = ({
  isOpen,
  onClose,
  mode,
  version,
  initialNotes = "",
  onSave,
  isSaving,
}: Props) => {
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
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton
      ariaTitle={t(mode === "add" ? "Add Version Notes" : "Edit Version Notes")}>
      <VStack as="form" onSubmit={handleSubmit(onSubmit)} gap={6} align="stretch">
        <VStack align="stretch" gap={1}>
          <Text textStyle="xl" fontWeight="bold">
            {t(mode === "add" ? "Add Version Notes" : "Edit Version Notes")}
          </Text>
          <Text textStyle="sm" color="text.subtle">
            {t(
              "Add the app version number so users can stay informed about update content, resulting in a better user experience.",
            )}
          </Text>
        </VStack>

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

        <HStack justify="flex-end" gap={3}>
          <Button variant="ghost" onClick={onClose} type="button">
            {t("Cancel")}
          </Button>
          <Button variant="primary" type="submit" loading={isSaving}>
            {t("Save")}
          </Button>
        </HStack>
      </VStack>
    </BaseModal>
  )
}
