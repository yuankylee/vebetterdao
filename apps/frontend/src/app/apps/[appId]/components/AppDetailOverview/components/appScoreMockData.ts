/** Brand accent for app score headline and breakdown bars (design spec). */
export const APP_SCORE_ACCENT_HEX = "#3DBA67"

/** TODO: replace with GET app score details API when available */
export const APP_SCORE_MOCK = {
  score: 85.12,
  ranking: 20,
  roundDate: "9 Dec, 2025",
  roundNumber: 77,
  breakdown: [
    { labelKey: "Distribution Efficiency", value: 60 },
    { labelKey: "Activity", value: 20 },
    { labelKey: "Community", value: 5 },
    { labelKey: "Profile Completeness", value: 0.12 },
  ] as const,
}
