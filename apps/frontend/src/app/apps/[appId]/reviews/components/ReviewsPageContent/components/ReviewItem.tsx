import { Box, Button, HStack, Stack, Text } from "@chakra-ui/react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { LuThumbsUp, LuThumbsDown, LuHand, LuChartBar } from "react-icons/lu"
import { PiPencilSimpleLineBold } from "react-icons/pi"

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
  const myVoteType = review.myVoteType

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
            <Box w={3} h={3} borderRadius="full" bg={getAuthorColor(review.author)} flexShrink={0} />
            <Text fontSize="xs" color="gray.600">
              {truncateAddress(review.author)}
            </Text>
          </HStack>
          <Text fontSize="xs" color="gray.500">
            {formatDate(review.blockTimestamp)}
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
            <HStack gap={1} color={myVoteType == 1 ? "#3DBA67" : "gray.500"}>
              <LuThumbsUp size={16} />
              <Text fontSize="sm" fontWeight="semibold">{`${upPct}%`}</Text>
            </HStack>
            <HStack gap={1} color={myVoteType == 2 ? "#C53030" : "gray.500"}>
              <LuThumbsDown size={16} />
              <Text fontSize="sm" fontWeight="semibold">{`${downPct}%`}</Text>
            </HStack>
            <HStack gap={1} color={myVoteType == 3 ? "#F2A54E" : "gray.500"}>
              <LuHand size={16} />
              <Text fontSize="sm" fontWeight="semibold">{`${reportPct}%`}</Text>
            </HStack>
            <Box
              as="button"
              onClick={() => setIsResultsOpen(true)}
              cursor="pointer"
              color="gray.500"
              _hover={{ color: "gray.600" }}
              display="flex"
              alignItems="center">
              <LuChartBar size={16} />
            </Box>
          </HStack>
        </HStack>
      </Stack>

      <ReviewResultsModal isOpen={isResultsOpen} onClose={() => setIsResultsOpen(false)} review={review} />
    </Box>
  )
}
