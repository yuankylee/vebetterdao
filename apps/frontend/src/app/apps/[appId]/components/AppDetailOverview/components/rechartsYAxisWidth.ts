/** Recharts YAxis defaults to 60px — size from tick labels so small values stay compact without clipping. */
export const rechartsYAxisWidth = (tickLabels: string[], fontSize = 11): number => {
  const longest = tickLabels.reduce((maxLen, label) => Math.max(maxLen, label.length), 0)
  // ~9px/char at 11px + padding; no upper cap so large integers still fit.
  return Math.max(28, Math.ceil(longest * (fontSize * 0.82) + 16))
}

/** Evenly spaced ticks (matches Recharts default count for short domains). */
export const rechartsLinearTicks = (max: number, count = 5): number[] => {
  if (!Number.isFinite(max) || max <= 0) return [0]
  if (count <= 1) return [0]
  return Array.from({ length: count }, (_, i) => (max * i) / (count - 1))
}
