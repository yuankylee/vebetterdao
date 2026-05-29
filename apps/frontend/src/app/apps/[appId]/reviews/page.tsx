"use client"

import { Spinner, VStack } from "@chakra-ui/react"
import dynamic from "next/dynamic"
import { use, useEffect } from "react"

import { MotionVStack } from "../../../../components/MotionVStack"
import AnalyticsUtils from "../../../../utils/AnalyticsUtils/AnalyticsUtils"

const ReviewsPageContent = dynamic(
  () => import("./components/ReviewsPageContent/ReviewsPageContent").then(mod => mod.ReviewsPageContent),
  {
    ssr: false,
    loading: () => (
      <VStack w="full" gap={12} h="80vh" justify="center">
        <Spinner size="lg" />
      </VStack>
    ),
  },
)

type Props = {
  params: Promise<{ appId: string }>
}

export default function AppReviews({ params }: Readonly<Props>) {
  const { appId } = use(params)
  useEffect(() => {
    AnalyticsUtils.trackPage(`App/${appId}/reviews`)
  }, [appId])
  return (
    <MotionVStack w="full">
      <ReviewsPageContent />
    </MotionVStack>
  )
}
