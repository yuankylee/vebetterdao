import { Box, Card, Link, Stack, Text } from "@chakra-ui/react"
import { UilArrowUpRight } from "@iconscout/react-unicons"

// TODO: replace with real data from backend API
const MOCK_SCORE = 85.12
const MOCK_RANKING = 20
const MOCK_ROUND_DATE = "9 Dec, 2025"
const MOCK_ROUND_NUMBER = 77

export const AppScoreCard = () => {
  return (
    <Card.Root variant="primary" bg="green.50" position="relative" h="full" overflow="hidden">
      {/* decorative gradient circles */}
      <Box
        position="absolute"
        top="-40px"
        right="-40px"
        w="160px"
        h="160px"
        borderRadius="full"
        bg="green.200"
        opacity={0.5}
      />
      <Box
        position="absolute"
        bottom="-30px"
        right="-20px"
        w="120px"
        h="120px"
        borderRadius="full"
        bg="green.100"
        opacity={0.6}
      />
      <Card.Body position="relative" zIndex={1} alignItems="flex-start">
        <Link
          position="absolute"
          top={4}
          right={4}
          textStyle="sm"
          color="text.default"
          _hover={{ color: "text.brand" }}>
          {"More"} <UilArrowUpRight size="14px" />
        </Link>
        <Stack gap={0} mb={10}>
          <Text textStyle="4xl" fontWeight="bold" color="green.700">
            {MOCK_SCORE.toFixed(2)}
          </Text>
          <Text textStyle="sm" color="text.subtle">
            {"App Score"}
          </Text>
        </Stack>
        <Stack gap={4}>
          <Stack gap={0}>
            <Text textStyle="lg" fontWeight="bold" color="text.default">
              {"#"}
              {MOCK_RANKING}
            </Text>
            <Text textStyle="sm" color="text.subtle">
              {"Ranking"}
            </Text>
          </Stack>
          <Text textStyle="md" fontWeight="semibold" color="text.default">
            {MOCK_ROUND_DATE}
            {" (Round #"}
            {MOCK_ROUND_NUMBER}
            {")"}
          </Text>
        </Stack>
      </Card.Body>
    </Card.Root>
  )
}
