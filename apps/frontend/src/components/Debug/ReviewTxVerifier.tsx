"use client"

import { Badge, Button, Code, Input, Stack, Text } from "@chakra-ui/react"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

import { normalizeTxId, useReviewManagerTx } from "@/hooks/xApp/useReviewManagerTx"

/** Local env, or any env when the page URL has `?tx_debug=1` (or `&tx_debug=1`). */
export function useShowReviewTxDebug(): boolean {
  const searchParams = useSearchParams()
  return searchParams.get("tx_debug") === "1"
}

type Props = {
  /** When set (e.g. after submit/update rating), input is filled and decoded automatically. */
  initialTxId?: string
  /** On-chain user rating for this app+wallet after the clause read settles (0 = not rated). */
  onChainRating?: number
  /** True while the on-chain rating read is in flight. */
  isRatingLoading?: boolean
  /** Connected wallet used for the on-chain rating read. */
  walletAddress?: string
}

/**
 * Debug UI: decode XAppReviewManager tx clauses/events via Thor.
 * Shown on `local`, or on any env when URL query `tx_debug=1` is present (wrap parent in `Suspense` for `useSearchParams`).
 */
export const ReviewTxVerifier = ({ initialTxId, onChainRating, isRatingLoading, walletAddress }: Props) => {
  const showDebug = useShowReviewTxDebug()
  const [input, setInput] = useState(initialTxId ?? "")
  const [activeId, setActiveId] = useState("")

  useEffect(() => {
    if (initialTxId === undefined) {
      setActiveId("")
      return
    }
    const n = normalizeTxId(initialTxId)
    setInput(n)
    setActiveId(n)
  }, [initialTxId])

  const { data, isFetching, error } = useReviewManagerTx(activeId)

  if (!showDebug) {
    return null
  }

  const handleVerify = () => {
    setActiveId(normalizeTxId(input))
  }

  return (
    <Stack gap={3} p={4} borderWidth="1px" borderRadius="md" borderColor="border.emphasized">
      <Text fontWeight="semibold" textStyle="sm">
        {"XAppReviewManager tx (debug)"}
      </Text>
      {!walletAddress ? (
        <Text textStyle="xs" color="fg.muted">
          {"No wallet — on-chain rating read is skipped."}
        </Text>
      ) : null}
      {walletAddress && isRatingLoading ? (
        <Text textStyle="sm" color="fg.muted">
          {"On-chain rating: loading…"}
        </Text>
      ) : null}
      {walletAddress && !isRatingLoading && onChainRating !== undefined ? (
        <Text textStyle="sm" color="fg.muted">
          {`On-chain rating: ${String(onChainRating)}`}
        </Text>
      ) : null}
      <Stack direction={{ base: "column", md: "row" }} gap={2}>
        <Input
          placeholder={"0x… transaction id"}
          value={input}
          onChange={e => setInput(e.target.value)}
          fontFamily="mono"
          size="sm"
        />
        <Button size="sm" variant="outline" onClick={handleVerify}>
          {"Verify"}
        </Button>
      </Stack>
      {isFetching && activeId ? <Text textStyle="sm">{"Loading…"}</Text> : null}
      {error ? (
        <Text textStyle="sm" color="red.fg">
          {error instanceof Error ? error.message : String(error)}
        </Text>
      ) : null}
      {data && activeId ? (
        <Stack gap={2} fontSize="sm">
          <Stack direction="row" gap={2} align="center" flexWrap="wrap">
            <Text fontWeight="semibold">{"Status"}</Text>
            <Badge
              colorPalette={data.reverted === undefined ? "gray" : data.reverted ? "red" : "green"}
              variant="subtle">
              {(() => {
                if (data.reverted === undefined) return "Unknown"
                if (data.reverted) return "Reverted"
                return "Success"
              })()}
            </Badge>
            {data.blockNumber ? (
              <Text as="span" color="fg.muted">
                {"Block"} {data.blockNumber}
              </Text>
            ) : null}
          </Stack>
          {data.origin ? (
            <Text color="fg.muted">
              {"Origin"} {data.origin}
            </Text>
          ) : null}
          <Text fontWeight="semibold">{"Decoded clauses"}</Text>
          {data.decodedClauses.length ? (
            <Code as="pre" whiteSpace="pre-wrap" wordBreak="break-all" p={2} fontSize="xs">
              {JSON.stringify(data.decodedClauses, null, 2)}
            </Code>
          ) : (
            <Text color="fg.muted">{"No matching clauses on review manager contract."}</Text>
          )}
          {data.decodeClauseErrors?.length ? (
            <>
              <Text fontWeight="semibold" color="orange.fg">
                {"Clause decode errors"}
              </Text>
              <Code as="pre" whiteSpace="pre-wrap" p={2} fontSize="xs">
                {JSON.stringify(data.decodeClauseErrors, null, 2)}
              </Code>
            </>
          ) : null}
          <Text fontWeight="semibold">{"Decoded events"}</Text>
          {data.decodedEvents.length ? (
            <Code as="pre" whiteSpace="pre-wrap" wordBreak="break-all" p={2} fontSize="xs">
              {JSON.stringify(data.decodedEvents, null, 2)}
            </Code>
          ) : (
            <Text color="fg.muted">{"No matching events."}</Text>
          )}
        </Stack>
      ) : null}
    </Stack>
  )
}
