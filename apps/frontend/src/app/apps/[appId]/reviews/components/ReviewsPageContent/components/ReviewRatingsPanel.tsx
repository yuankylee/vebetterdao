import { Button, Card, Stack, Text } from "@chakra-ui/react"
import { useWallet, useWalletModal } from "@vechain/vechain-kit"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { FaRegStar, FaStar } from "react-icons/fa"

import { Review } from "../../../../../../../api/reviews/types"
import { useUserAppReview } from "../../../../../../../api/reviews/useUserAppReview"

const STAR_COLOR = "#ED8936"
const STAR_EMPTY_COLOR = "#CBD5E0"

const InteractiveStars = ({
  value,
  onChange,
  size = 32,
}: {
  value: number
  onChange: (v: number) => void
  size?: number
}) => {
  const [hovered, setHovered] = useState(0)
  return (
    <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
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
            {filled ? <FaStar size={size} color={STAR_COLOR} /> : <FaRegStar size={size} color={STAR_EMPTY_COLOR} />}
          </button>
        )
      })}
    </div>
  )
}

type Props = {
  appId: string
  onWriteReview: (initialRating?: number, existingReview?: Review | null) => void
}

export const ReviewRatingsPanel = ({ appId, onWriteReview }: Props) => {
  const { t } = useTranslation()
  const { account } = useWallet()
  const { open: openWalletModal } = useWalletModal()
  const [selectedRating, setSelectedRating] = useState(0)

  const { data: userReview } = useUserAppReview(appId, account?.address)
  const existingRating = userReview?.rating ?? 0

  const handleAction = (rating: number, existing?: Review | null) => {
    if (!account?.address) {
      openWalletModal()
      return
    }
    onWriteReview(rating, existing)
  }

  return (
    <Stack gap={4}>
      {/* Leave a Rating panel — shown when user has no existing review */}
      {!userReview && (
        <Card.Root borderRadius="xl">
          <Card.Body p={4}>
            <Stack gap={3} align="center">
              <Stack gap={1} w="full">
                <Text fontWeight="bold" fontSize="lg">
                  {t("Ratings")}
                </Text>
                <Text color="gray.500" fontSize="sm">
                  {t("Please rate this App. Your feedback is the driving force behind its growth")}
                </Text>
              </Stack>
              <InteractiveStars value={selectedRating} onChange={setSelectedRating} />
              <Text fontSize="xs" color="gray.400">
                {t("Tap to rate")}
              </Text>
              <Button variant="primary" w="full" borderRadius="full" onClick={() => handleAction(selectedRating)}>
                {t("Leave a Rating")}
              </Button>
            </Stack>
          </Card.Body>
        </Card.Root>
      )}

      {/* Ratings & Reviews panel — shown when user already has a review */}
      {userReview && (
        <Card.Root borderRadius="xl">
          <Card.Body p={4}>
            <Stack gap={3} align="center">
              <Stack gap={1} w="full">
                <Text fontWeight="bold" fontSize="lg">
                  {t("Ratings & Reviews")}
                </Text>
                <Text color="gray.500" fontSize="sm">
                  {t("Please rate this App. Your feedback is the driving force behind its growth")}
                </Text>
              </Stack>
              <InteractiveStars value={selectedRating || existingRating} onChange={setSelectedRating} />
              <Text fontSize="xs" color="gray.400">
                {t("Tap to rate")}
              </Text>
              <Button
                variant="primary"
                w="full"
                borderRadius="full"
                onClick={() => handleAction(selectedRating || existingRating, userReview)}>
                {t("Update Rating")}
              </Button>
            </Stack>
          </Card.Body>
        </Card.Root>
      )}
    </Stack>
  )
}
