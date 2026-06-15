/** If rating is strictly between two whole numbers (e.g. 3 < n < 4), show as k+0.5 (3.5 stars); whole numbers unchanged. */
export const displayRatingForStars = (n: number): number => {
  if (!Number.isFinite(n) || n <= 0) return 0
  const clamped = Math.min(5, Math.max(0, n))
  const lo = Math.floor(clamped)
  const hi = Math.ceil(clamped)
  if (lo === hi) return clamped
  if (clamped > lo && clamped < hi) return lo + 0.5
  return clamped
}
