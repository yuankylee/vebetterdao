import { Button, HStack, Input, Stack, Text, Textarea } from "@chakra-ui/react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { toaster } from "@/components/ui/toaster"

import { Review } from "../../../../../api/reviews/types"
import { BaseModal } from "../../../../../components/BaseModal"
import { useEditReview } from "../../../../../hooks/xApp/useEditReview"
import { useSubmitReview } from "../../../../../hooks/xApp/useSubmitReview"

type ReviewForm = {
  title: string
  content: string
}

type Props = {
  isOpen: boolean
  onClose: () => void
  appId: string
  existingReview?: Review | null
  onSuccess?: () => void
}

export const WriteReviewModal = ({ isOpen, onClose, appId, existingReview, onSuccess }: Props) => {
  const { t } = useTranslation()
  const isEdit = !!existingReview

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReviewForm>({
    defaultValues: {
      title: existingReview?.title ?? "",
      content: existingReview?.content ?? "",
    },
  })

  // When switching to edit mode, populate form with existing review data
  useEffect(() => {
    if (isOpen && existingReview) {
      reset({ title: existingReview.title, content: existingReview.content })
    }
  }, [isOpen, existingReview, reset])

  // Cancel: close without resetting (preserves in-progress data)
  const handleClose = () => {
    onClose()
  }

  const handleSuccess = () => {
    reset({ title: "", content: "" })
    toaster.create({ title: t("Operation succeeded"), type: "success" })
    onSuccess?.()
    onClose()
  }

  const submitReview = useSubmitReview({ onSuccess: handleSuccess })
  const editReview = useEditReview({ onSuccess: handleSuccess })

  const onSubmit = (data: ReviewForm) => {
    if (isEdit && existingReview) {
      editReview.sendTransaction({
        reviewId: existingReview.reviewId,
        title: data.title,
        content: data.content,
      })
    } else {
      submitReview.sendTransaction({ appId, title: data.title, content: data.content })
    }
  }

  return (
    <BaseModal isOpen={isOpen} onClose={handleClose} showCloseButton isCloseable modalContentProps={{ maxW: "500px" }}>
      <Stack gap={5}>
        <Text fontWeight="bold" fontSize="xl">
          {isEdit ? t("Edit the review") : t("Write a Review")}
        </Text>

        <Stack as="form" gap={4} onSubmit={handleSubmit(onSubmit)}>
          <Stack gap={1}>
            <Input
              placeholder={t("Title")}
              borderRadius="xl"
              size="lg"
              {...register("title", {
                required: t("Please enter"),
                maxLength: { value: 100, message: t("Maximum 100 characters") },
              })}
              borderColor={errors.title ? "red.400" : undefined}
            />
            {errors.title && (
              <Text fontSize="xs" color="red.400" px={1}>
                {errors.title.message}
              </Text>
            )}
          </Stack>

          <Stack gap={1}>
            <Textarea
              placeholder={t("Review")}
              borderRadius="xl"
              rows={5}
              resize="none"
              {...register("content", {
                required: t("Please enter"),
                maxLength: { value: 1000, message: t("Maximum 1000 characters") },
              })}
              borderColor={errors.content ? "red.400" : undefined}
            />
            {errors.content && (
              <Text fontSize="xs" color="red.400" px={1}>
                {errors.content.message}
              </Text>
            )}
          </Stack>

          <HStack justify="flex-end" gap={3} pt={1}>
            <Button variant="outline" borderRadius="full" onClick={handleClose}>
              {t("Cancel")}
            </Button>
            <Button variant="primary" borderRadius="full" type="submit">
              {t("Send")}
            </Button>
          </HStack>
        </Stack>
      </Stack>
    </BaseModal>
  )
}
