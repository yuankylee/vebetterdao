export const toIntlLocale = (language: string) => (language === "tw" ? "zh-TW" : language)

export const formatLocalizedLongDate = (timestampMs: number, language: string) =>
  new Intl.DateTimeFormat(toIntlLocale(language), {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(timestampMs))

export const formatLocalizedLongDateFromSeconds = (timestampSeconds: number, language: string) =>
  formatLocalizedLongDate(timestampSeconds * 1000, language)

export const formatLocalizedShortDate = (timestampMs: number, language: string) =>
  new Intl.DateTimeFormat(toIntlLocale(language), {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(timestampMs))

export const formatLocalizedShortDateFromSeconds = (timestampSeconds: number, language: string) =>
  formatLocalizedShortDate(timestampSeconds * 1000, language)
