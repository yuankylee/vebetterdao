import {
  Box,
  ButtonGroup,
  Grid,
  GridItem,
  HStack,
  IconButton,
  Link,
  NativeSelect,
  Pagination,
  Skeleton,
  Stack,
  Text,
  Card,
} from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { useWallet, useWalletModal } from "@vechain/vechain-kit"
import { NavArrowLeft, NavArrowRight } from "iconoir-react"
import { useParams } from "next/navigation"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { ReviewsPageBanner } from "@/app/components/ActionBanners/components/ReviewsPageBanner"

import { Review } from "../../../../../../api/reviews/types"
import { useAppReviews } from "../../../../../../api/reviews/useAppReviews"
import { useVoteOnReview } from "../../../../../../hooks/xApp/useVoteOnReview"
import { WriteReviewModal } from "../../../components/AppRatingsAndReviews/WriteReviewModal"

import { ReviewItem } from "./components/ReviewItem"
import { ReviewRatingsPanel } from "./components/ReviewRatingsPanel"

const PAGE_SIZE = 10

export const ReviewsPageContent = () => {
  const { t } = useTranslation()
  const { appId } = useParams<{ appId: string }>()
  const queryClient = useQueryClient()
  const { account } = useWallet()
  const { open: openWalletModal } = useWalletModal()

  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalExistingReview, setModalExistingReview] = useState<Review | null | undefined>(undefined)

  const {
    data: reviewsData,
    isLoading,
    refetch,
  } = useAppReviews(appId, {
    page: currentPage - 1,
    size: PAGE_SIZE,
    sortBy: sortBy || undefined,
    wallet: account?.address,
  })

  const { sendTransaction: sendVoteOnReview } = useVoteOnReview({
    onSuccess: () => {
      void refetch()
    },
  })
  const reviews = reviewsData?.data ?? []
  const totalReviews = reviewsData?.pagination?.total ?? 0
  const totalPages = reviewsData?.pagination?.totalPages ?? 0

  const handleWriteReview = (existingReview?: Review | null) => {
    if (!account?.address) {
      openWalletModal()
      return
    }
    setModalExistingReview(existingReview ?? null)
    setIsModalOpen(true)
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    setCurrentPage(1)
  }

  return (
    <>
      <Stack gap={6} w="full">
        {/* Breadcrumb */}
        <HStack gap={2} fontSize="sm">
          <Link href={`/apps/${appId}`} color="gray.500" variant="plain">
            {t("App details")}
          </Link>
          <Text color="gray.400">{" > "}</Text>
          <Text color="gray.800" fontWeight="medium">
            {t("Ratings & Reviews")}
          </Text>
        </HStack>

        <ReviewsPageBanner onClick={handleWriteReview} />

        {/* Main grid */}
        <Grid templateColumns={["1fr", "1fr", "2fr 1fr"]} gap={6} alignItems="flex-start">
          {/* Reviews list */}
          <GridItem>
            <Card.Root borderRadius="xl">
              <Stack gap={4}>
                <HStack justify="space-between" align="center">
                  <Text fontWeight="bold" fontSize="lg">
                    {`${t("Reviews")}(${totalReviews})`}
                  </Text>
                  <NativeSelect.Root size="sm" w="240px">
                    <NativeSelect.Field
                      borderRadius="12px"
                      value={sortBy}
                      onChange={e => handleSortChange(e.target.value)}>
                      <option value="newest">{t("Sort By")}</option>
                      <option value="most_upvotes">{t("Most Upvotes")}</option>
                      <option value="most_downvotes">{t("Most Downvotes")}</option>
                      <option value="most_reports">{t("Most Reports")}</option>
                      <option value="my_reviews">{t("My Reviews")}</option>
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                </HStack>

                {isLoading ? (
                  <Stack gap={3}>
                    {Array.from({ length: 3 }, (_, i) => (
                      <Skeleton key={i} h="160px" borderRadius="xl" />
                    ))}
                  </Stack>
                ) : reviews.length === 0 ? (
                  <Box textAlign="center" py={12}>
                    <Text color="gray.400">{t("No reviews yet. Be the first to write one!")}</Text>
                  </Box>
                ) : (
                  <Stack gap={3}>
                    {reviews.map((review: Review) => (
                      <ReviewItem
                        key={review.id}
                        review={review}
                        currentUserAddress={account?.address}
                        onEdit={r => handleWriteReview(r)}
                        onVote={(reviewId, voteType) => {
                          void sendVoteOnReview({ reviewId, voteType })
                        }}
                      />
                    ))}
                  </Stack>
                )}

                {totalPages > 1 && (
                  <Pagination.Root
                    w={"auto"}
                    mx={{ base: "auto", md: "unset" }}
                    count={totalReviews ?? 1}
                    pageSize={PAGE_SIZE}
                    page={currentPage}
                    display="flex"
                    flexWrap="wrap"
                    alignItems="center"
                    justifyContent="flex-end"
                    gap="4"
                    siblingCount={1}
                    onPageChange={e => setCurrentPage(e.page)}>
                    <Pagination.PageText format="compact" textStyle="sm" />
                    <ButtonGroup variant="ghost" size="xs" flexWrap="wrap">
                      <Pagination.PrevTrigger asChild>
                        <IconButton>
                          <NavArrowLeft />
                        </IconButton>
                      </Pagination.PrevTrigger>
                      <Pagination.Items
                        render={page => (
                          <IconButton rounded="full" variant={{ base: "ghost", _selected: "surface" }}>
                            {page.value}
                          </IconButton>
                        )}
                      />
                      <Pagination.NextTrigger asChild>
                        <IconButton>
                          <NavArrowRight />
                        </IconButton>
                      </Pagination.NextTrigger>
                    </ButtonGroup>
                  </Pagination.Root>
                )}
              </Stack>
            </Card.Root>
          </GridItem>

          {/* Rating sidebar */}
          <GridItem>
            <ReviewRatingsPanel appId={appId} />
          </GridItem>
        </Grid>
      </Stack>

      <WriteReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        appId={appId}
        existingReview={modalExistingReview}
        onSuccess={async () => {
          if (appId) {
            await queryClient.invalidateQueries({ queryKey: ["appReviews", appId] })
          }
          setModalExistingReview(undefined)
          setIsModalOpen(false)
        }}
      />
    </>
  )
}
