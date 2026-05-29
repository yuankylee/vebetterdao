import { Button, HStack, Input, Stack, Text, Textarea } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { FaRegStar, FaStar } from "react-icons/fa"

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
  initialRating?: number
  onSuccess?: () => void
}

const STAR_COLOR = "#ED8936"
const STAR_EMPTY_COLOR = "#CBD5E0"

const StarSelector = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => {
  const [hovered, setHovered] = useState(0)
  return (
    <HStack gap={1} justify="center">
      {Array.from({ length: 5 }, (_, i) => {
        const filled = (hovered || value) > i
        return (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHovered(i + 1)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(i + 1)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
            {filled ? <FaStar size={28} color={STAR_COLOR} /> : <FaRegStar size={28} color={STAR_EMPTY_COLOR} />}
          </button>
        )
      })}
    </HStack>
  )
}

export const WriteReviewModal = ({ isOpen, onClose, appId, existingReview, initialRating = 0, onSuccess }: Props) => {
  const { t } = useTranslation()
  const [rating, setRating] = useState(existingReview?.rating ?? initialRating)
  const [ratingError, setRatingError] = useState(false)
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
      setRating(existingReview.rating)
    }
  }, [isOpen, existingReview, reset])

  // When opening for create mode with a pre-selected rating, update star
  useEffect(() => {
    if (isOpen && !existingReview && initialRating > 0) {
      setRating(initialRating)
    }
  }, [isOpen, existingReview, initialRating])

  // Cancel: close without resetting (preserves in-progress data)
  const handleClose = () => {
    setRatingError(false)
    onClose()
  }

  const handleSuccess = () => {
    reset({ title: "", content: "" })
    setRating(0)
    setRatingError(false)
    toaster.create({ title: t("Operation succeeded"), type: "success" })
    onSuccess?.()
    onClose()
  }

  const submitReview = useSubmitReview({ onSuccess: handleSuccess })
  const editReview = useEditReview({ onSuccess: handleSuccess })

  const onSubmit = (data: ReviewForm) => {
    if (rating === 0) {
      setRatingError(true)
      return
    }
    setRatingError(false)
    if (isEdit && existingReview) {
      editReview.sendTransaction({
        reviewId: existingReview.reviewId,
        rating,
        title: data.title,
        content: data.content,
      })
    } else {
      submitReview.sendTransaction({ appId, rating, title: data.title, content: data.content })
    }
  }

  return (
    <BaseModal isOpen={isOpen} onClose={handleClose} showCloseButton isCloseable modalContentProps={{ maxW: "500px" }}>
      <Stack gap={5}>
        <Text fontWeight="bold" fontSize="xl">
          {isEdit ? t("Edit the review") : t("Write a Review")}
        </Text>

        <Stack gap={1}>
          <StarSelector
            value={rating}
            onChange={v => {
              setRating(v)
              setRatingError(false)
            }}
          />
          {ratingError && (
            <Text fontSize="xs" color="red.400" textAlign="center">
              {t("Please select a rating")}
            </Text>
          )}
        </Stack>

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
