import { Button, Card, Stack, Text } from "@chakra-ui/react"
import { useWallet, useWalletModal } from "@vechain/vechain-kit"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { FaRegStar, FaStar } from "react-icons/fa"

import { toaster } from "@/components/ui/toaster"

import { useUserRating } from "../../../../../../../api/contracts/xApps/hooks/useUserRating"
import { useSubmitRating } from "../../../../../../../hooks/xApp/useSubmitRating"
import { useUpdateRating } from "../../../../../../../hooks/xApp/useUpdateRating"

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
}

export const ReviewRatingsPanel = ({ appId }: Props) => {
  const { t } = useTranslation()
  const { account } = useWallet()
  const { open: openWalletModal } = useWalletModal()
  const [selectedRating, setSelectedRating] = useState(0)

  const { data: existingOnChainRating, refetch: refetchRating } = useUserRating(appId, account?.address)
  const existingRating = existingOnChainRating ?? 0

  const handleSuccess = () => {
    toaster.create({ title: t("Operation succeeded"), type: "success" })
    refetchRating()
  }

  const submitRating = useSubmitRating({ onSuccess: handleSuccess })
  const updateRating = useUpdateRating({ onSuccess: handleSuccess })

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
      {existingRating === 0 && (
        <Card.Root borderRadius="xl">
          <Card.Body>
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
              <Button variant="primary" w="full" borderRadius="full" mt="44px" onClick={handleLeaveRating}>
                {t("Leave a Rating")}
              </Button>
            </Stack>
          </Card.Body>
        </Card.Root>
      )}

      {/* Update Rating panel — shown when user already has a rating */}
      {existingRating > 0 && (
        <Card.Root borderRadius="xl">
          <Card.Body>
            <Stack gap={3} align="center">
              <Stack gap={1} w="full">
                <Text fontWeight="bold" fontSize="lg">
                  {t("Ratings")}
                </Text>
                <Text color="gray.500" fontSize="sm">
                  {t("Please rate this App. Your feedback is the driving force behind its growth")}
                </Text>
              </Stack>
              <InteractiveStars value={selectedRating || existingRating} onChange={setSelectedRating} />
              <Text fontSize="xs" color="gray.400">
                {t("Tap to rate")}
              </Text>
              <Button variant="primary" w="full" borderRadius="full" mt="44px" onClick={handleUpdateRating}>
                {t("Update Rating")}
              </Button>
            </Stack>
          </Card.Body>
        </Card.Root>
      )}
    </Stack>
  )
}
