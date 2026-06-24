import { Box, Button, Card, HStack, Link, Skeleton, Stack, Text } from "@chakra-ui/react"
import { UilArrowUpRight } from "@iconscout/react-unicons"
import { useQueryClient } from "@tanstack/react-query"
import { useWallet, useWalletModal } from "@vechain/vechain-kit"
import dayjs from "dayjs"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa"
import { LuHand, LuThumbsDown, LuThumbsUp } from "react-icons/lu"

import { Review } from "../../../../../api/reviews/types"
import { useAppRatingSummary } from "../../../../../api/reviews/useAppRatingSummary"
import { useAppReviews } from "../../../../../api/reviews/useAppReviews"
import { useCheckAppReviewEligibility } from "../../../../../hooks/xApp/useCheckAppReviewEligibility"
import { displayRatingForStars } from "../../../../../utils/displayRatingForStars"
import { useCurrentAppInfo } from "../../hooks/useCurrentAppInfo"

import { WriteReviewModal } from "./WriteReviewModal"

const truncateAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`

const formatCount = (n: number) => {
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`
  return n.toString()
}

const STAR_COLOR = "#FFB566"

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

const ReviewCard = ({ review }: { review: Review }) => {
  const upPct = Math.round(review.upvotes.percentage)
  const downPct = Math.round(review.downvotes.percentage)
  const reportPct = Math.round(review.reports.percentage)

  return (
    <Box bg="gray.50" borderRadius="xl" p={4}>
      <Stack gap={2}>
        <Text fontWeight="600" fontSize="md" lineClamp={2}>
          {review.title}
        </Text>
        <Text color="gray.500" fontSize="sm" lineClamp={2}>
          {review.content}
        </Text>
        <HStack justify="space-between">
          <HStack gap={1.5}>
            <Box w={3} h={3} borderRadius="full" bg={"red"} flexShrink={0} />
            <Text fontSize="xs" color="gray.500">
              {truncateAddress(review.author)}
            </Text>
          </HStack>
          <Text fontSize="xs" color="gray.500">
            {dayjs.unix(Number(review.blockTimestamp)).format("MMM D, YYYY")}
          </Text>
        </HStack>
        <HStack borderTopWidth={1} mt={2} borderColor="gray.200" pt={3} alignItems="center" justifyContent={"flex-end"}>
          <HStack justify="center" gap={4}>
            <HStack gap={1} color="gray.500">
              <LuThumbsUp size={16} />
              <Text fontSize="sm" color="gray.500" fontWeight="semibold">{`${upPct}%`}</Text>
            </HStack>
            <HStack gap={1} color="gray.500">
              <LuThumbsDown size={16} />
              <Text fontSize="sm" color="gray.500" fontWeight="semibold">{`${downPct}%`}</Text>
            </HStack>
            <HStack gap={1} color="gray.500">
              <LuHand size={16} />
              <Text fontSize="sm" color="gray.500" fontWeight="semibold">{`${reportPct}%`}</Text>
            </HStack>
          </HStack>
        </HStack>
      </Stack>
    </Box>
  )
}

export const AppRatingsAndReviews = () => {
  const { t } = useTranslation()
  const { app } = useCurrentAppInfo()
  const appId = app?.id ?? ""
  const queryClient = useQueryClient()
  const { account } = useWallet()
  const { open: openWalletModal } = useWalletModal()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const {
    data: ratingSummary,
    isPending: ratingSummaryPending,
    isFetching: ratingSummaryFetching,
  } = useAppRatingSummary(appId, account?.address)
  const { data: reviewsData, isLoading: reviewsLoading } = useAppReviews(appId, { wallet: account?.address })

  const average = ratingSummary?.average ?? 0
  const count = ratingSummary?.count ?? 0
  const ratingDisplay = average.toFixed(1)

  const visibleReviews = (reviewsData?.data ?? []).filter(r => !r.isHidden).slice(0, 2)
  const isLoading = ratingSummaryPending || ratingSummaryFetching || reviewsLoading
  const { checkEligibility } = useCheckAppReviewEligibility()

  const handleWriteReview = async () => {
    if (!account?.address) {
      openWalletModal()
      return
    }
    const eligible = await checkEligibility(appId, account.address)
    if (!eligible) return
    setIsModalOpen(true)
  }

  return (
    <>
      <Card.Root w="full" borderRadius="xl">
        <Card.Body p={0}>
          <Stack gap={4}>
            <HStack justify="space-between" align="center">
              <Text fontWeight="700" fontSize="xl">
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
                <Text fontSize="3xl" fontWeight="700" lineHeight={1}>
                  {ratingDisplay}
                </Text>
                <Stack align="flex-end" gap={1}>
                  <StarRating average={average} />
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
              visibleReviews.map((review: Review) => <ReviewCard key={review.reviewId} review={review} />)
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
        onSuccess={async () => {
          if (appId) {
            await queryClient.invalidateQueries({ queryKey: ["appReviews", appId] })
            await queryClient.invalidateQueries({ queryKey: ["appRatingSummary", appId] })
          }
        }}
      />
    </>
  )
}
