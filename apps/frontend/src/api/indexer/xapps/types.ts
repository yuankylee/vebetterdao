/**
 * Hand-typed indexer response for xApp score endpoints.
 *
 * TODO: after `yarn generate:schema` includes `/xapp/apps/{appId}/scores/previousRound`,
 * swap for schema-derived types from `paths` in `../schema.d.ts`.
 */

/** GET /api/v1/xapp/apps/{appId}/scores/previousRound */
export type XAppPreviousRoundScore = {
  appId: string
  round: number
  score?: number
  rank?: number
  roundDate?: number
  distribution?: number
  activity?: number
  community?: number
  health?: number
}
