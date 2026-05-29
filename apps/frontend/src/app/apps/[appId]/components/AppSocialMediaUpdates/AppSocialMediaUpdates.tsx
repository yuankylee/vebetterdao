"use client"

import { Box, HStack, Skeleton, Stack, Text } from "@chakra-ui/react"
import { Component, type ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { TweetSkeleton } from "react-tweet"

import { useTweets } from "@/api/twitter/hooks/useTweets"

import { useCurrentAppMetadata } from "../../hooks/useCurrentAppMetadata"
import { ThemedTweet } from "../AppTweets/components/ThemedTweet"

class TweetErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

export const AppSocialMediaUpdates = () => {
  const { t } = useTranslation()
  const { appMetadata, appMetadataLoading } = useCurrentAppMetadata()
  const tweetIds = appMetadata?.tweets?.filter(Boolean) ?? []
  const tweetQueries = useTweets(tweetIds)

  if (appMetadataLoading) {
    return (
      <Stack gap={3}>
        <Skeleton h="24px" w="200px" borderRadius="md" />
        <HStack gap={4} overflow="hidden">
          {Array.from({ length: 3 }, (_, i) => (
            <Box key={i} minW="280px" flexShrink={0}>
              <TweetSkeleton />
            </Box>
          ))}
        </HStack>
      </Stack>
    )
  }

  if (tweetIds.length === 0) return null

  return (
    <Stack gap={4}>
      <Text fontWeight="bold" fontSize="lg">
        {t("Social Media Updates")}
      </Text>
      <Box
        overflowX="auto"
        pb={2}
        sx={{
          "&::-webkit-scrollbar": { h: "6px" },
          "&::-webkit-scrollbar-track": { bg: "transparent" },
          "&::-webkit-scrollbar-thumb": { bg: "gray.300", borderRadius: "full" },
        }}>
        <HStack gap={4} align="flex-start" w="max-content">
          {tweetQueries.map((q, idx) => (
            <Box key={tweetIds[idx]} minW="280px" maxW="320px" flexShrink={0}>
              {q.isLoading ? (
                <TweetSkeleton />
              ) : q.data ? (
                <TweetErrorBoundary>
                  <ThemedTweet tweet={q.data} />
                </TweetErrorBoundary>
              ) : null}
            </Box>
          ))}
        </HStack>
      </Box>
    </Stack>
  )
}
