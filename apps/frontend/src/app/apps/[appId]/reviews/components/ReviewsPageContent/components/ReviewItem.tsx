import { Box, Button, HStack, Stack, Text } from "@chakra-ui/react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { FaThumbsDown, FaThumbsUp } from "react-icons/fa"
import { LuChartBar, LuPencil } from "react-icons/lu"
import { MdFrontHand } from "react-icons/md"

import { Review } from "../../../../../../../api/reviews/types"

import { ReviewResultsModal } from "./ReviewResultsModal"

const AUTHOR_COLORS = ["red.400", "blue.400", "green.400", "purple.400", "orange.400", "teal.400"]
const getAuthorColor = (address: string) => AUTHOR_COLORS[parseInt(address.slice(2, 4), 16) % AUTHOR_COLORS.length]

const truncateAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`

const formatDate = (ts: number) =>
  new Date(ts * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })

type Props = {
  review: Review
  currentUserAddress?: string
  onEdit?: (review: Review) => void
}

export const ReviewItem = ({ review, currentUserAddress, onEdit }: Props) => {
  const { t } = useTranslation()
  const [isResultsOpen, setIsResultsOpen] = useState(false)
  const isOwn = currentUserAddress?.toLowerCase() === review.author.toLowerCase()
  const upPct = Math.round(review.upvotes.percentage)
  const downPct = Math.round(review.downvotes.percentage)
  const reportPct = Math.round(review.reports.percentage)

  return (
    <Box borderWidth={1} borderColor="gray.200" borderRadius="xl" p={4} bg="white" overflow="hidden">
      <Stack gap={3}>
        {review.isHidden && (
          <Box bg="red.50" borderRadius="md" py={2} px={3}>
            <Text color="red.500" fontSize="sm" textAlign="center" fontWeight="medium">
              {t("Your review has been reported multiple times and has been hidden.")}
            </Text>
          </Box>
        )}

        <Text fontWeight="bold" fontSize="md">
          {review.title}
        </Text>
        <Text fontSize="sm" color="gray.700" whiteSpace="pre-wrap">
          {review.content}
        </Text>

        <HStack justify="space-between" align="center">
          <HStack gap={2}>
            <Box w={3} h={3} borderRadius="full" bg={getAuthorColor(review.author)} flexShrink={0} />
            <Text fontSize="xs" color="gray.600">
              {truncateAddress(review.author)}
            </Text>
          </HStack>
          <Text fontSize="xs" color="gray.500">
            {formatDate(review.blockTimestamp)}
          </Text>
        </HStack>

        <HStack justify="space-between" align="center" pt={1} borderTopWidth={1} borderColor="gray.100">
          <Box>
            {isOwn && (
              <Button size="xs" variant="outline" borderRadius="full" gap={1} onClick={() => onEdit?.(review)}>
                <LuPencil size={12} />
                {t("Edit")}
              </Button>
            )}
          </Box>
          <HStack gap={4}>
            <HStack gap={1} color={upPct > 50 ? "green.500" : "gray.500"}>
              <FaThumbsUp size={13} />
              <Text fontSize="xs">{`${upPct}%`}</Text>
            </HStack>
            <HStack gap={1} color={downPct > 50 ? "red.500" : "gray.500"}>
              <FaThumbsDown size={13} />
              <Text fontSize="xs">{`${downPct}%`}</Text>
            </HStack>
            <HStack gap={1} color="gray.500">
              <MdFrontHand size={14} />
              <Text fontSize="xs">{`${reportPct}%`}</Text>
            </HStack>
            <Box
              as="button"
              onClick={() => setIsResultsOpen(true)}
              cursor="pointer"
              color="gray.400"
              _hover={{ color: "gray.600" }}
              display="flex"
              alignItems="center">
              <LuChartBar size={14} />
            </Box>
          </HStack>
        </HStack>
      </Stack>

      <ReviewResultsModal isOpen={isResultsOpen} onClose={() => setIsResultsOpen(false)} review={review} />
    </Box>
  )
}
