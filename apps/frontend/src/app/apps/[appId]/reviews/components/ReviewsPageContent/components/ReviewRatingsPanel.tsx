import { Button, Card, HStack, Stack, Text } from "@chakra-ui/react"
import { useWallet, useWalletModal } from "@vechain/vechain-kit"
import { Suspense, useEffect, useState, type ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa"

import { ReviewTxVerifier } from "@/components/Debug/ReviewTxVerifier"
import { toaster } from "@/components/ui/toaster"

import { useUserRating } from "../../../../../../../api/contracts/xApps/hooks/useUserRating"
import { useAppRatingSummary } from "../../../../../../../api/reviews/useAppRatingSummary"
import { useCheckAppReviewEligibility } from "../../../../../../../hooks/xApp/useCheckAppReviewEligibility"
import { useSubmitRating } from "../../../../../../../hooks/xApp/useSubmitRating"
import { useUpdateRating } from "../../../../../../../hooks/xApp/useUpdateRating"
import { displayRatingForStars } from "../../../../../../../utils/displayRatingForStars"

const STAR_COLOR = "#FFB566"
const STAR_EMPTY_COLOR = "#D2D5D9"

const formatCount = (n: number) => {
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`
  return n.toString()
}

const StarRating = ({ average }: { average: number }) => {
  const rating = displayRatingForStars(average)
  return (
    <HStack gap={0.5}>
      {Array.from({ length: 5 }, (_, i) => {
        if (i < Math.floor(rating)) return <FaStar key={i} color={STAR_COLOR} size={18} />
        if (i < rating && rating % 1 >= 0.5) return <FaStarHalfAlt key={i} color={STAR_COLOR} size={18} />
        return <FaRegStar key={i} color={STAR_COLOR} size={18} />
      })}
    </HStack>
  )
}

const InteractiveStars = ({
  value,
  onChange,
  displayRatingFromApi,
  size = 44,
}: {
  /** Whole stars 0–5 from user taps only (0 = none yet). */
  value: number
  onChange: (v: number) => void
  /** When `value === 0` and user is not hovering, show this API rating (between k and k+1 → k.5 stars). */
  displayRatingFromApi?: number
  size?: number
}) => {
  const [hovered, setHovered] = useState(0)
  const displayApi = displayRatingForStars(displayRatingFromApi ?? 0)
  const showApiHalfStars = value === 0 && displayApi > 0 && hovered === 0

  return (
    <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
      {Array.from({ length: 5 }, (_, i) => {
        const starBtn = (child: ReactNode) => (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHovered(i + 1)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(i + 1)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
            {child}
          </button>
        )

        if (hovered > 0) {
          const filled = hovered > i
          return starBtn(
            filled ? <FaStar size={size} color={STAR_COLOR} /> : <FaRegStar size={size} color={STAR_EMPTY_COLOR} />,
          )
        }

        if (showApiHalfStars) {
          const r = displayApi
          if (i < Math.floor(r)) return starBtn(<FaStar size={size} color={STAR_COLOR} />)
          if (i < r && r % 1 >= 0.5) return starBtn(<FaStarHalfAlt size={size} color={STAR_COLOR} />)
          return starBtn(<FaRegStar size={size} color={STAR_EMPTY_COLOR} />)
        }

        const filled = value > i
        return starBtn(
          filled ? <FaStar size={size} color={STAR_COLOR} /> : <FaRegStar size={size} color={STAR_EMPTY_COLOR} />,
        )
      })}
    </div>
  )
}

type Props = {
  appId: string
}

export const ReviewRatingsPanel = ({ appId }: Props) => {
  const { t } = useTranslation()
  const { account } = useWallet()
  const { open: openWalletModal } = useWalletModal()
  const [selectedRating, setSelectedRating] = useState(0)
  const [ratingError, setRatingError] = useState(false)
  const [lastRatingTxId, setLastRatingTxId] = useState<string>()

  const { data: ratingSummary, refetch: refetchRatingSummary } = useAppRatingSummary(appId, account?.address)
  const existingRating = ratingSummary?.userRating ?? 0
  const average = ratingSummary?.average ?? 0
  const count = ratingSummary?.count ?? 0
  const ratingDisplay = average.toFixed(1)

  const {
    data: chainRating,
    refetch: refetchChainRating,
    isPending,
    isFetching,
  } = useUserRating(appId, account?.address)

  const handleSuccess = () => {
    toaster.create({ title: t("Operation succeeded"), type: "success" })
    void refetchRatingSummary()
    void refetchChainRating()
  }

  const submitRating = useSubmitRating({ onSuccess: handleSuccess })
  const updateRating = useUpdateRating({ onSuccess: handleSuccess })
  const { checkEligibility } = useCheckAppReviewEligibility()

  useEffect(() => {
    const fromUpdate = updateRating.txReceipt?.meta?.txID
    const fromSubmit = submitRating.txReceipt?.meta?.txID
    const raw = fromUpdate ?? fromSubmit
    if (raw) setLastRatingTxId(String(raw))
  }, [updateRating.txReceipt?.meta?.txID, submitRating.txReceipt?.meta?.txID])

  const handleLeaveRating = async () => {
    if (!account?.address) {
      openWalletModal()
      return
    }
    if (selectedRating === 0) {
      setRatingError(true)
      return
    }
    const eligible = await checkEligibility(appId, account.address)
    if (!eligible) return
    submitRating.sendTransaction({ appId, rating: selectedRating })
  }

  const handleUpdateRating = () => {
    if (!account?.address) {
      openWalletModal()
      return
    }
    const rating = selectedRating > 0 ? selectedRating : existingRating
    if (rating === 0) {
      setRatingError(true)
      return
    }
    updateRating.sendTransaction({ appId, rating })
  }

  return (
    <Stack gap={4}>
      <Card.Root borderRadius="xl">
        <Card.Body>
          <Stack gap={11} align="center">
            <HStack justify="space-between" align="center" w="full">
              <Stack align="flex-start" gap={1}>
                <Text fontSize="3xl" fontWeight="700" lineHeight={1}>
                  {ratingDisplay}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {t("Ratings")}
                </Text>
              </Stack>

              <Stack align="flex-end" gap={1}>
                <StarRating average={average} />
                <Text color="gray.500" fontSize="sm">
                  {`${formatCount(count)} ${t("ratings")}`}
                </Text>
              </Stack>
            </HStack>

            <Stack gap={1} w="full" align="center">
              <InteractiveStars
                value={selectedRating}
                displayRatingFromApi={ratingSummary?.hasRated ? existingRating : undefined}
                onChange={v => {
                  setSelectedRating(v)
                  setRatingError(false)
                }}
              />
              <Text textStyle="sm" fontWeight="semibold" color={ratingError ? "red.500" : undefined}>
                {ratingError ? t("Please tap to rate") : t("Tap to rate")}
              </Text>
            </Stack>
            <Stack gap={2}>
              <Button
                variant="primary"
                w="full"
                borderRadius="full"
                onClick={ratingSummary?.hasRated ? handleUpdateRating : handleLeaveRating}>
                {ratingSummary?.hasRated ? t("Update Rating") : t("Leave a Rating")}
              </Button>
              <Text color="gray.500" fontSize="sm">
                {t("Please rate this App. Your feedback is the driving force behind its growth")}
              </Text>
            </Stack>
          </Stack>
        </Card.Body>
      </Card.Root>

      <Suspense fallback={null}>
        <ReviewTxVerifier
          key={appId}
          initialTxId={lastRatingTxId}
          walletAddress={account?.address}
          isRatingLoading={!!account?.address && (isPending || isFetching)}
          onChainRating={chainRating}
        />
      </Suspense>
    </Stack>
  )
}
