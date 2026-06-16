import { Box, Button, HStack, Stack, Text } from "@chakra-ui/react"
import { useWallet, useWalletModal } from "@vechain/vechain-kit"
import { type ReactNode, useState } from "react"
import { useTranslation } from "react-i18next"
import { LuThumbsUp, LuThumbsDown, LuHand, LuChartBar } from "react-icons/lu"
import { PiPencilSimpleLineBold } from "react-icons/pi"

import { toaster } from "@/components/ui/toaster"

import { Review } from "../../../../../../../api/reviews/types"
import { type ReviewVoteType } from "../../../../../../../hooks/xApp/useVoteOnReview"
import { formatLocalizedLongDateFromSeconds } from "../../../../../../../utils/formatLocalizedLongDate"

import { ReviewResultsModal } from "./ReviewResultsModal"

// const AUTHOR_COLORS = ["red.400", "blue.400", "green.400", "purple.400", "orange.400", "teal.400"]
// const getAuthorColor = (address: string) => AUTHOR_COLORS[parseInt(address.slice(2, 4), 16) % AUTHOR_COLORS.length]

const truncateAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`

const UP_COLOR = "#3DBA67"
const DOWN_COLOR = "#C53030"
const REPORT_COLOR = "#F2A54E"
const NEUTRAL_COLOR = "gray.500"

type Props = {
  review: Review
  currentUserAddress?: string
  onEdit?: (review: Review) => void
  onVote?: (reviewId: number, voteType: ReviewVoteType) => void
}

export const ReviewItem = ({ review, currentUserAddress, onEdit, onVote }: Props) => {
  const { t, i18n } = useTranslation()
  const { account } = useWallet()
  const { open: openWalletModal } = useWalletModal()
  const [isResultsOpen, setIsResultsOpen] = useState(false)
  const isOwn = currentUserAddress?.toLowerCase() === review.author.toLowerCase()
  const upPct = Math.round(review.upvotes.percentage)
  const downPct = Math.round(review.downvotes.percentage)
  const reportPct = Math.round(review.reports.percentage)
  const myVote = review.myVoteType ?? 0
  const hasVoted = myVote !== 0

  const handleVotePress = (voteType: ReviewVoteType) => {
    if (hasVoted) return
    if (!onVote) return
    if (!account?.address) {
      openWalletModal()
      return
    }
    if (isOwn) {
      toaster.create({ title: t("You cannot vote on your own review."), type: "warning" })
      return
    }
    if (review.isHidden) {
      toaster.create({ title: t("You cannot vote on a hidden review."), type: "warning" })
      return
    }
    onVote(review.reviewId, voteType)
  }

  const voteButton = (voteType: ReviewVoteType, icon: ReactNode, label: string, pct: number, activeColor: string) => {
    const isActive = myVote === voteType
    const color = isActive ? activeColor : NEUTRAL_COLOR
    return (
      <Box
        as="button"
        type="button"
        display="flex"
        alignItems="center"
        gap={1}
        onClick={() => handleVotePress(voteType)}
        cursor={hasVoted ? "default" : "pointer"}
        color={color}
        bg="transparent"
        border="none"
        p={1}
        borderRadius="md"
        _hover={hasVoted ? undefined : { bg: "gray.100" }}
        aria-label={label}>
        {icon}
        <Text fontSize="sm" fontWeight="semibold">{`${pct}%`}</Text>
      </Box>
    )
  }

  return (
    <Box borderWidth={1} borderColor="gray.200" bg={"#F9F9FA"} borderRadius="xl" p={4} overflow="hidden">
      <Stack gap={4}>
        {review.isHidden && (
          <Box bg="red.50" borderRadius="md" py={2} px={3}>
            <Text color="red.500" fontSize="sm" textAlign="center" fontWeight="medium">
              {t("Your review has been reported multiple times and has been hidden.")}
            </Text>
          </Box>
        )}

        <Stack gap={1}>
          <Text fontWeight="bold" fontSize="md">
            {review.title}
          </Text>
          <Text fontSize="sm" color="gray.700" whiteSpace="pre-wrap">
            {review.content}
          </Text>
        </Stack>

        <HStack justify="space-between" align="center">
          <HStack gap={2}>
            <Box w={3} h={3} borderRadius="full" bg={"red"} flexShrink={0} />
            <Text fontSize="xs" color="gray.600">
              {truncateAddress(review.author)}
            </Text>
          </HStack>
          <Text fontSize="xs" color="gray.500">
            {formatLocalizedLongDateFromSeconds(review.blockTimestamp, i18n.language)}
          </Text>
        </HStack>

        <HStack justify="space-between" align="center" borderTopWidth={1} borderColor="#E7E9EB" pt={4}>
          <Box>
            {isOwn && (
              <Button
                size="sm"
                px={3}
                colorPalette={"blue"}
                variant="outline"
                borderRadius="full"
                gap={1}
                onClick={() => onEdit?.(review)}
                css={{
                  backgroundColor: "#FFF",
                }}>
                <PiPencilSimpleLineBold />
                {t("Edit")}
              </Button>
            )}
          </Box>
          <HStack gap={4}>
            {voteButton(1, <LuThumbsUp size={16} />, t("Upvote"), upPct, UP_COLOR)}
            {voteButton(2, <LuThumbsDown size={16} />, t("Downvote"), downPct, DOWN_COLOR)}
            {voteButton(3, <LuHand size={16} />, t("Report content"), reportPct, REPORT_COLOR)}
            <Box
              as="button"
              type="button"
              onClick={() => setIsResultsOpen(true)}
              cursor="pointer"
              color="gray.500"
              _hover={{ color: "gray.600" }}
              display="flex"
              alignItems="center"
              bg="transparent"
              border="none"
              p={1}
              borderRadius="md"
              aria-label={t("Result details")}>
              <LuChartBar size={16} />
            </Box>
          </HStack>
        </HStack>
      </Stack>

      <ReviewResultsModal isOpen={isResultsOpen} onClose={() => setIsResultsOpen(false)} review={review} />
    </Box>
  )
}
