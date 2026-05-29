import { Box, Card, HStack, Image, Skeleton, Stack, Text } from "@chakra-ui/react"
import { useTranslation } from "react-i18next"

import { convertUriToUrl } from "@/utils/uri"

import { useCurrentAppMetadata } from "../../hooks/useCurrentAppMetadata"

const safeUrl = (uri: string) => {
  try {
    return convertUriToUrl(uri)
  } catch {
    return uri
  }
}

export const AppTutorial = () => {
  const { t } = useTranslation()
  const { appMetadata, appMetadataLoading } = useCurrentAppMetadata()

  if (appMetadataLoading) {
    return (
      <Card.Root w="full" borderRadius="xl">
        <Card.Body p={5}>
          <Stack gap={4}>
            <Skeleton h="24px" w="160px" borderRadius="md" />
            <HStack gap={3} overflow="hidden">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} minW="260px" h="160px" borderRadius="xl" flexShrink={0} />
              ))}
            </HStack>
          </Stack>
        </Card.Body>
      </Card.Root>
    )
  }

  const hasVideo = !!appMetadata?.tutorial_video
  const images: string[] = appMetadata?.tutorial_images ?? []

  if (!hasVideo && images.length === 0) return null

  return (
    <Card.Root w="full" borderRadius="xl">
      <Card.Body p={5}>
        <Stack gap={4}>
          <Text fontWeight="bold" fontSize="lg">
            {t("App Tutorial")}
          </Text>

          {hasVideo ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video
              src={safeUrl(appMetadata!.tutorial_video!)}
              controls
              style={{ width: "100%", maxHeight: 320, borderRadius: 12 }}
            />
          ) : (
            <Box
              overflowX="auto"
              pb={1}
              sx={{
                "&::-webkit-scrollbar": { h: "6px" },
                "&::-webkit-scrollbar-track": { bg: "transparent" },
                "&::-webkit-scrollbar-thumb": { bg: "gray.300", borderRadius: "full" },
              }}>
              <HStack gap={3} align="flex-start" w="max-content">
                {images.map((uri, idx) => (
                  <Box
                    key={idx}
                    minW="260px"
                    h="160px"
                    borderRadius="xl"
                    overflow="hidden"
                    bg="gray.100"
                    flexShrink={0}
                    display="flex"
                    alignItems="center"
                    justifyContent="center">
                    <Image src={safeUrl(uri)} alt={`Tutorial ${idx + 1}`} w="full" h="full" objectFit="cover" />
                  </Box>
                ))}
              </HStack>
            </Box>
          )}
        </Stack>
      </Card.Body>
    </Card.Root>
  )
}
