import { Box, Button, Card, HStack, Link, Skeleton, Stack, Text } from "@chakra-ui/react"
import { UilArrowUpRight } from "@iconscout/react-unicons"
import { useWallet, useWalletModal } from "@vechain/vechain-kit"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { FaRegStar, FaStar, FaStarHalfAlt, FaThumbsDown, FaThumbsUp } from "react-icons/fa"
import { MdFrontHand } from "react-icons/md"

import { useAppRatingStats } from "../../../../../api/contracts/xApps/hooks/useAppRatingStats"
import { Review } from "../../../../../api/reviews/types"
import { useAppReviews } from "../../../../../api/reviews/useAppReviews"
import { useCurrentAppInfo } from "../../hooks/useCurrentAppInfo"

import { WriteReviewModal } from "./WriteReviewModal"

const AUTHOR_COLORS = ["red.400", "blue.400", "green.400", "purple.400", "orange.400", "teal.400"]
const getAuthorColor = (address: string) => AUTHOR_COLORS[parseInt(address.slice(2, 4), 16) % AUTHOR_COLORS.length]

const truncateAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`

const formatCount = (n: bigint) => {
  const num = Number(n)
  if (num >= 1000) return `${(num / 1000).toFixed(0)}k`
  return num.toString()
}

const formatDate = (ts: number) =>
  new Date(ts * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })

const STAR_COLOR = "#FFB566"

const StarRating = ({ avgRating }: { avgRating: bigint }) => {
  const rating = Number(avgRating) / 100
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

const ReviewCard = ({ review }: { review: Review }) => {
  const upPct = Math.round(review.upvotes.percentage)
  const downPct = Math.round(review.downvotes.percentage)
  const reportPct = Math.round(review.reports.percentage)

  return (
    <Box bg="gray.50" borderRadius="xl" p={4}>
      <Stack gap={2}>
        <Text fontWeight="bold" lineClamp={1}>
          {review.title}
        </Text>
        <Text color="gray.500" fontSize="sm" lineClamp={2}>
          {review.content}
        </Text>
        <HStack justify="space-between">
          <HStack gap={1.5}>
            <Box w={3} h={3} borderRadius="full" bg={getAuthorColor(review.author)} flexShrink={0} />
            <Text fontSize="xs" color="gray.600">
              {truncateAddress(review.author)}
            </Text>
          </HStack>
          <Text fontSize="xs" color="gray.500">
            {formatDate(review.blockTimestamp)}
          </Text>
        </HStack>
        <Box borderTopWidth={1} borderColor="gray.200" pt={2}>
          <HStack justify="center" gap={6}>
            <HStack gap={1}>
              <FaThumbsUp size={13} />
              <Text fontSize="xs">{`${upPct}%`}</Text>
            </HStack>
            <HStack gap={1}>
              <FaThumbsDown size={13} />
              <Text fontSize="xs">{`${downPct}%`}</Text>
            </HStack>
            <HStack gap={1}>
              <MdFrontHand size={14} />
              <Text fontSize="xs">{`${reportPct}%`}</Text>
            </HStack>
          </HStack>
        </Box>
      </Stack>
    </Box>
  )
}

export const AppRatingsAndReviews = () => {
  const { t } = useTranslation()
  const { app } = useCurrentAppInfo()
  const appId = app?.id ?? ""
  const { account } = useWallet()
  const { open: openWalletModal } = useWalletModal()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: statsData, isLoading: statsLoading } = useAppRatingStats(appId)
  const { data: reviewsData, isLoading: reviewsLoading, refetch } = useAppReviews(appId, { wallet: account?.address })

  const count = (statsData as { count: bigint; avgRating: bigint } | undefined)?.count ?? 0n
  const avgRating = (statsData as { count: bigint; avgRating: bigint } | undefined)?.avgRating ?? 0n
  const ratingDisplay = (Number(avgRating) / 100).toFixed(1)

  const visibleReviews = (reviewsData?.data ?? []).filter(r => !r.isHidden).slice(0, 2)
  const isLoading = statsLoading || reviewsLoading

  const handleWriteReview = () => {
    if (!account?.address) {
      openWalletModal()
      return
    }
    setIsModalOpen(true)
  }

  return (
    <>
      <Card.Root w="full" borderRadius="xl">
        <Card.Body p={0}>
          <Stack gap={4}>
            <HStack justify="space-between" align="center">
              <Text fontWeight="bold" fontSize="lg">
                {t("Ratings & Reviews")}
              </Text>
              <Link
                href={`/apps/${appId}/reviews`}
                textStyle="md"
                fontWeight="normal"
                color="actions.secondary.text-lighter"
                _focus={{ outline: "none", boxShadow: "none" }}>
                {t("More")}
                <UilArrowUpRight />
              </Link>
            </HStack>

            {isLoading ? (
              <Skeleton h="60px" borderRadius="md" />
            ) : (
              <HStack justify="space-between" align="center">
                <Text fontWeight="black" fontSize="5xl" lineHeight={1}>
                  {ratingDisplay}
                </Text>
                <Stack align="flex-end" gap={1}>
                  <StarRating avgRating={avgRating} />
                  <Text color="gray.500" fontSize="sm">
                    {`${formatCount(count)} ${t("ratings")}`}
                  </Text>
                </Stack>
              </HStack>
            )}

            {isLoading ? (
              <>
                <Skeleton h="120px" borderRadius="xl" />
                <Skeleton h="120px" borderRadius="xl" />
              </>
            ) : visibleReviews.length === 0 ? (
              <Text color="gray.400" fontSize="sm" textAlign="center" py={4}>
                {t("No reviews yet")}
              </Text>
            ) : (
              visibleReviews.map((review: Review) => <ReviewCard key={review.id} review={review} />)
            )}

            <Button variant="primary" w="full" borderRadius="full" onClick={handleWriteReview}>
              {t("Write a Review")}
            </Button>
          </Stack>
        </Card.Body>
      </Card.Root>

      <WriteReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        appId={appId}
        onSuccess={() => {
          refetch()
        }}
      />
    </>
  )
}
