import { getConfig } from "@repo/config"
import { useQuery } from "@tanstack/react-query"
import { useThor } from "@vechain/vechain-kit"
import type { Result } from "ethers"

import { ReviewManagerInterface } from "./reviewManagerInterface"

type ThorForTxDecode = NonNullable<ReturnType<typeof useThor>>

export const getReviewManagerTxQueryKey = (txId: string) => ["reviewManagerTx", txId] as const

export type DecodedReviewManagerClause = {
  clauseIndex: number
  name: string
  args: Record<string, string>
}

export type DecodedReviewManagerEvent = {
  name: string
  args: Record<string, string>
}

export type ReviewManagerDecodedTx = {
  txId: string
  origin: string
  reverted: boolean | undefined
  blockNumber: string | undefined
  decodedClauses: DecodedReviewManagerClause[]
  decodeClauseErrors?: { clauseIndex: number; message: string }[]
  decodedEvents: DecodedReviewManagerEvent[]
}

function normalizeAddr(a: string): string {
  return a.toLowerCase()
}

/** Normalize VeChain tx id (with or without 0x prefix). */
export function normalizeTxId(id: string): string {
  const t = id.trim()
  if (/^[0-9a-fA-F]{64}$/.test(t)) return `0x${t}`
  return t
}

type AbiInputsFragment = { inputs: ReadonlyArray<{ name?: string | null }> }

function formatAbiValue(val: unknown): string {
  if (val === undefined || val === null) return ""
  if (typeof val === "bigint") return val.toString()
  return String(val)
}

/** Map decoded Result to named args using the ABI fragment (ethers Result often only has numeric keys). */
function formatResultArgs(args: Result, fragment?: AbiInputsFragment): Record<string, string> {
  const out: Record<string, string> = {}
  if (fragment?.inputs?.length) {
    const n = Math.min(fragment.inputs.length, args.length)
    for (let i = 0; i < n; i++) {
      const input = fragment.inputs[i]
      const name = input?.name && input.name.length > 0 ? input.name : `arg${i}`
      out[name] = formatAbiValue(args[i])
    }
    return out
  }
  for (let i = 0; i < args.length; i++) {
    out[`arg${i}`] = formatAbiValue(args[i])
  }
  return out
}

export async function decodeReviewManagerTransaction(
  thor: ThorForTxDecode,
  txId: string,
  reviewManagerAddress: string,
): Promise<ReviewManagerDecodedTx> {
  const normalizedId = normalizeTxId(txId)
  const target = normalizeAddr(reviewManagerAddress)
  const [tx, receipt] = await Promise.all([
    thor.transactions.getTransaction(normalizedId),
    thor.transactions.getTransactionReceipt(normalizedId),
  ])

  const decodedClauses: DecodedReviewManagerClause[] = []
  const decodeClauseErrors: { clauseIndex: number; message: string }[] = []

  if (tx?.clauses) {
    tx.clauses.forEach((clause, clauseIndex) => {
      const to = clause.to ? normalizeAddr(clause.to) : ""
      if (!to || to !== target) return
      const data = clause.data?.trim() ?? ""
      if (!data || data === "0x") return
      try {
        const parsed = ReviewManagerInterface.parseTransaction({ data, value: 0n })
        decodedClauses.push({
          clauseIndex,
          name: parsed.name,
          args: formatResultArgs(parsed.args, parsed.fragment),
        })
      } catch (e) {
        decodeClauseErrors.push({
          clauseIndex,
          message: e instanceof Error ? e.message : String(e),
        })
      }
    })
  }

  const decodedEvents: DecodedReviewManagerEvent[] = []
  if (receipt?.outputs) {
    for (const output of receipt.outputs) {
      if (!output?.events) continue
      for (const ev of output.events) {
        const addr = ev.address ? normalizeAddr(ev.address) : ""
        if (!addr || addr !== target) continue
        const topics = (ev.topics ?? []).filter((t): t is string => !!t)
        if (!topics.length) continue
        try {
          const log = ReviewManagerInterface.parseLog({
            topics,
            data: ev.data?.length ? ev.data : "0x",
          })
          decodedEvents.push({
            name: log.name,
            args: formatResultArgs(log.args, log.fragment),
          })
        } catch {
          // not an XAppReviewManager event from this ABI
        }
      }
    }
  }

  const blockNum = receipt?.meta?.blockNumber
  const blockNumber = blockNum === undefined || blockNum === null ? undefined : String(blockNum)

  return {
    txId: normalizedId,
    origin: tx?.origin ?? "",
    reverted: receipt?.reverted,
    blockNumber,
    decodedClauses,
    decodeClauseErrors: decodeClauseErrors.length ? decodeClauseErrors : undefined,
    decodedEvents,
  }
}

/**
 * Fetches a transaction + receipt from Thor and decodes XAppReviewManager clauses and events.
 */
export const useReviewManagerTx = (txId: string) => {
  const thor = useThor()
  const address = getConfig().xAppReviewManagerContractAddress
  const normalized = normalizeTxId(txId)
  const valid = /^0x[0-9a-fA-F]{64}$/.test(normalized)

  return useQuery({
    queryKey: getReviewManagerTxQueryKey(normalized),
    queryFn: () => decodeReviewManagerTransaction(thor, normalized, address!),
    enabled: !!thor && valid && !!address,
    staleTime: 60_000,
  })
}
