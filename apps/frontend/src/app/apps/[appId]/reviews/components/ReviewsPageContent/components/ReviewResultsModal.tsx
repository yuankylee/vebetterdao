import { Box, CloseButton, HStack, Input, InputGroup, Skeleton, Stack, Table, Text } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { LuThumbsUp, LuThumbsDown, LuHand, LuSearch } from "react-icons/lu"

import { Review, VoteEntry } from "../../../../../../../api/reviews/types"
import { useReviewVotes } from "../../../../../../../api/reviews/useReviewVotes"
import { BaseModal } from "../../../../../../../components/BaseModal"
import { toIntlLocale } from "../../../../../../../utils/formatLocalizedLongDate"

const formatNumber = (n: number, language: string) => n.toLocaleString(toIntlLocale(language))

const timeAgo = (ts: number, t: (key: string, options?: Record<string, unknown>) => string) => {
  const diff = Math.floor(Date.now() / 1000) - ts
  if (diff < 60) return t("just now")
  if (diff < 3600) return t("{{count}} min ago", { count: Math.floor(diff / 60) })
  if (diff < 86400) return t("{{count}}h ago", { count: Math.floor(diff / 3600) })
  if (diff < 2592000) return t("{{count}}d ago", { count: Math.floor(diff / 86400) })
  const months = Math.floor(diff / 2592000)
  return months === 1 ? t("a month ago") : t("{{count}} months ago", { count: months })
}

const truncateAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`

const VOTE_CONFIG = {
  1: {
    icon: LuThumbsUp,
    iconColor: "#3DBA67",
    color: "green.600",
    borderColor: "green.400",
    bg: "green.50",
  },
  2: {
    icon: LuThumbsDown,
    iconColor: "#C53030",
    color: "red.500",
    borderColor: "red.400",
    bg: "red.50",
  },
  3: {
    icon: LuHand,
    iconColor: "#F2A54E",
    color: "orange.600",
    borderColor: "orange.400",
    bg: "orange.50",
  },
} as const

const voteTypeLabelKey = (voteType: 1 | 2 | 3) => {
  if (voteType === 1) return "Upvote"
  if (voteType === 2) return "Downvote"
  return "Report content"
}

const VoteBadge = ({ voteType }: { voteType: 1 | 2 | 3 }) => {
  const { t } = useTranslation()
  const cfg = VOTE_CONFIG[voteType]
  const Icon = cfg.icon
  return (
    <HStack
      gap={1}
      px={3}
      py={1}
      borderWidth={1}
      borderColor={cfg.borderColor}
      borderRadius="6px"
      bg={"#FFFFFF"}
      display="inline-flex"
      w="fit-content">
      <Icon size={16} color={cfg.iconColor} />
      <Text fontSize="xs" color={cfg.color} fontWeight="medium">
        {t(voteTypeLabelKey(voteType))}
      </Text>
    </HStack>
  )
}

const StackedBar = ({ upPct, downPct, reportPct }: { upPct: number; downPct: number; reportPct: number }) => {
  if (upPct + downPct + reportPct === 0) return <Box h={2} borderRadius="full" bg="gray.200" w="full" />
  return (
    <Box h={2.5} borderRadius="full" overflow="hidden" w="full" display="flex">
      {upPct > 0 && <Box bg="#3DBA67" h="full" style={{ width: `${upPct}%` }} />}
      {downPct > 0 && <Box bg="#C53030" h="full" style={{ width: `${downPct}%` }} />}
      {reportPct > 0 && <Box bg="#F2A54E" h="full" style={{ width: `${reportPct}%` }} />}
    </Box>
  )
}

type Props = {
  isOpen: boolean
  onClose: () => void
  review: Review
}

export const ReviewResultsModal = ({ isOpen, onClose, review }: Props) => {
  const { t, i18n } = useTranslation()
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    if (!isOpen) {
      setSearch("")
      setDebouncedSearch("")
    }
  }, [isOpen])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const total = review.upvotes.count + review.downvotes.count + review.reports.count
  const upPct = Math.round(review.upvotes.percentage)
  const downPct = Math.round(review.downvotes.percentage)
  const reportPct = Math.round(review.reports.percentage)

  const { data: votesData, isLoading: votesLoading } = useReviewVotes(isOpen ? review.reviewId : undefined, {
    search: debouncedSearch,
    size: 50,
  })

  const votes: VoteEntry[] = votesData?.data ?? []

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      modalContentProps={{ maxW: "600px" }}
      modalBodyProps={{ p: 6 }}>
      <Stack gap={5}>
        {/* Header */}
        <HStack justify="space-between" align="center">
          <Text fontWeight="bold" fontSize="xl">
            {t("Result details")}
          </Text>
          <CloseButton onClick={onClose} size="md" />
        </HStack>

        {/* Acquisition Records */}
        <Box bg="gray.50" borderRadius="xl" p={4}>
          <Stack gap={3}>
            <Text fontWeight="bold" fontSize="md">
              {t("Acquisition Records")}
            </Text>
            <StackedBar upPct={upPct} downPct={downPct} reportPct={reportPct} />
            <Table.Root size="sm">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader fontWeight="semibold">{t("Option")}</Table.ColumnHeader>
                  <Table.ColumnHeader fontWeight="semibold">{t("Voter")}</Table.ColumnHeader>
                  <Table.ColumnHeader fontWeight="semibold" textAlign="right">
                    {t("Percentage")}
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                <Table.Row>
                  <Table.Cell>
                    <HStack gap={2} alignItems="center">
                      <LuThumbsUp size={16} color="#38A169" />
                      <Text fontSize="sm" fontWeight="semibold">
                        {t("Upvote")}
                      </Text>
                    </HStack>
                  </Table.Cell>
                  <Table.Cell>{formatNumber(review.upvotes.count, i18n.language)}</Table.Cell>
                  <Table.Cell textAlign="right">{`${upPct}%`}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>
                    <HStack gap={2}>
                      <LuThumbsDown size={16} color="#E53E3E" />
                      <Text fontSize="sm">{t("Downvote")}</Text>
                    </HStack>
                  </Table.Cell>
                  <Table.Cell>{formatNumber(review.downvotes.count, i18n.language)}</Table.Cell>
                  <Table.Cell textAlign="right">{`${downPct}%`}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>
                    <HStack gap={2}>
                      <LuHand size={16} color="#DD6B20" />
                      <Text fontSize="sm">{t("Report content")}</Text>
                    </HStack>
                  </Table.Cell>
                  <Table.Cell>{formatNumber(review.reports.count, i18n.language)}</Table.Cell>
                  <Table.Cell textAlign="right">{`${reportPct}%`}</Table.Cell>
                </Table.Row>
                <Table.Row fontWeight="semibold">
                  <Table.Cell>{t("Total")}</Table.Cell>
                  <Table.Cell>{formatNumber(total, i18n.language)}</Table.Cell>
                  <Table.Cell textAlign="right">{"100%"}</Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table.Root>
          </Stack>
        </Box>

        {/* Voters */}
        <Box bg="gray.50" borderRadius="xl" p={4}>
          <Stack gap={3}>
            <Text fontWeight="bold" fontSize="md">
              {t("Voters")}
            </Text>
            <InputGroup startElement={<LuSearch size={16} color="gray" />}>
              <Input
                placeholder={t("Search voter address or domain")}
                borderRadius="12px"
                bg="white"
                value={search}
                onChange={e => setSearch(e.target.value)}
                size="md"
              />
            </InputGroup>

            {votesLoading ? (
              <Stack gap={2}>
                {Array.from({ length: 4 }, (_, i) => (
                  <Skeleton key={i} h="40px" borderRadius="md" />
                ))}
              </Stack>
            ) : votes.length === 0 ? (
              <Text color="gray.400" fontSize="sm" textAlign="center" py={4}>
                {t("No votes found")}
              </Text>
            ) : (
              <Table.Root size="sm">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader fontWeight="semibold">{t("Voters")}</Table.ColumnHeader>
                    <Table.ColumnHeader fontWeight="semibold">{t("Voted Option")}</Table.ColumnHeader>
                    <Table.ColumnHeader fontWeight="semibold" textAlign="right">
                      {t("Voting Time")}
                    </Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {votes.map((vote, idx) => (
                    <Table.Row key={`${vote.voter}-${idx}`}>
                      <Table.Cell>
                        <Text fontSize="sm" color="blue.500" cursor="pointer">
                          {truncateAddress(vote.voter)}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <VoteBadge voteType={vote.voteType as 1 | 2 | 3} />
                      </Table.Cell>
                      <Table.Cell textAlign="right">
                        <Text fontSize="sm" color="gray.500">
                          {timeAgo(vote.timestamp, t)}
                        </Text>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            )}
          </Stack>
        </Box>
      </Stack>
    </BaseModal>
  )
}
