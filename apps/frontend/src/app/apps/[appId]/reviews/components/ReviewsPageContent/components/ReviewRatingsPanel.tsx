import { Button, Card, Stack, Text } from "@chakra-ui/react"
import { useWallet, useWalletModal } from "@vechain/vechain-kit"
import { Suspense, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { FaRegStar, FaStar } from "react-icons/fa"

import { ReviewTxVerifier } from "@/components/Debug/ReviewTxVerifier"
import { toaster } from "@/components/ui/toaster"

import { useUserRating } from "../../../../../../../api/contracts/xApps/hooks/useUserRating"
import { useAppRatingSummary } from "../../../../../../../api/reviews/useAppRatingSummary"
import { useSubmitRating } from "../../../../../../../hooks/xApp/useSubmitRating"
import { useUpdateRating } from "../../../../../../../hooks/xApp/useUpdateRating"

const STAR_COLOR = "#FFB566"
const STAR_EMPTY_COLOR = "#D2D5D9"

const InteractiveStars = ({
  value,
  onChange,
  size = 40,
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
}

export const ReviewRatingsPanel = ({ appId }: Props) => {
  const { t } = useTranslation()
  const { account } = useWallet()
  const { open: openWalletModal } = useWalletModal()
  const [selectedRating, setSelectedRating] = useState(0)
  const [lastRatingTxId, setLastRatingTxId] = useState<string>()

  const { data: ratingSummary, refetch: refetchRatingSummary } = useAppRatingSummary(appId, account?.address)
  const existingRating = ratingSummary?.userRating ?? 0

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

  useEffect(() => {
    const fromUpdate = updateRating.txReceipt?.meta?.txID
    const fromSubmit = submitRating.txReceipt?.meta?.txID
    const raw = fromUpdate ?? fromSubmit
    if (raw) setLastRatingTxId(String(raw))
  }, [updateRating.txReceipt?.meta?.txID, submitRating.txReceipt?.meta?.txID])

  const handleLeaveRating = () => {
    if (!account?.address) {
      openWalletModal()
      return
    }
    if (selectedRating === 0) return
    submitRating.sendTransaction({ appId, rating: selectedRating })
  }

  const handleUpdateRating = () => {
    if (!account?.address) {
      openWalletModal()
      return
    }
    const rating = selectedRating || existingRating
    if (rating === 0) return
    updateRating.sendTransaction({ appId, rating })
  }

  return (
    <Stack gap={4}>
      {/* Leave a Rating panel — shown when user has not yet rated */}
      {!ratingSummary?.hasRated && (
        <Card.Root borderRadius="xl">
          <Card.Body>
            <Stack gap={11} align="center">
              <Stack gap={1} w="full">
                <Text fontWeight="bold" fontSize="lg">
                  {t("Ratings")}
                </Text>
                <Text color="gray.500" fontSize="sm">
                  {t("Please rate this App. Your feedback is the driving force behind its growth")}
                </Text>
              </Stack>
              <Stack gap={1} w="full" align="center">
                <InteractiveStars value={selectedRating} onChange={setSelectedRating} />
                <Text textStyle="sm" fontWeight="semibold">
                  {t("Tap to rate")}
                </Text>
              </Stack>

              <Button variant="primary" w="full" borderRadius="full" onClick={handleLeaveRating}>
                {t("Leave a Rating")}
              </Button>
            </Stack>
          </Card.Body>
        </Card.Root>
      )}

      {/* Update Rating panel — shown when user already has a rating */}
      {ratingSummary?.hasRated && (
        <Card.Root borderRadius="xl">
          <Card.Body>
            <Stack gap={11} align="center">
              <Stack gap={1} w="full">
                <Text fontWeight="bold" fontSize="lg">
                  {t("Ratings")}
                </Text>
                <Text color="gray.500" fontSize="sm">
                  {t("Please rate this App. Your feedback is the driving force behind its growth")}
                </Text>
              </Stack>
              <Stack gap={1} w="full" align="center">
                <InteractiveStars value={selectedRating || existingRating} onChange={setSelectedRating} />
                <Text textStyle="sm" fontWeight="semibold">
                  {t("Tap to rate")}
                </Text>
              </Stack>
              <Button variant="primary" w="full" borderRadius="full" onClick={handleUpdateRating}>
                {t("Update Rating")}
              </Button>
            </Stack>
          </Card.Body>
        </Card.Root>
      )}

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
