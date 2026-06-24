"use client"

import { Box, Card, HStack, Skeleton, Stack, Heading } from "@chakra-ui/react"
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

const extractTweetId = (urlOrId: string): string | null => {
  if (/^\d+$/.test(urlOrId)) return urlOrId
  const match = urlOrId.match(/\/status\/(\d+)/)
  return match ? match[1] : null
}

export const AppSocialMediaUpdates = () => {
  const { t } = useTranslation()
  const { appMetadata, appMetadataLoading } = useCurrentAppMetadata()
  const tweetIds = (appMetadata?.tweets?.filter(Boolean) ?? [])
    .map(extractTweetId)
    .filter((id): id is string => id !== null)
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
    <Card.Root w="full" variant="primary">
      <Card.Body>
        <Stack gap={4}>
          <Heading fontWeight="700" fontSize="xl">
            {t("Social Media Updates")}
          </Heading>
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
                <Box
                  key={tweetIds[idx]}
                  w="320px"
                  maxW="320px"
                  h="362px"
                  flexShrink={0}
                  overflowY="auto"
                  sx={{
                    "&::-webkit-scrollbar": { w: "4px" },
                    "&::-webkit-scrollbar-track": { bg: "transparent" },
                    "&::-webkit-scrollbar-thumb": { bg: "gray.300", borderRadius: "full" },
                  }}>
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
      </Card.Body>
    </Card.Root>
  )
}
