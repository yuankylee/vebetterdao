import { useCallback } from "react"
import { useTranslation } from "react-i18next"

import { fetchAppReviewEligibility } from "@/api/reviews/fetchAppReviewEligibility"
import { toaster } from "@/components/ui/toaster"

const NOT_ELIGIBLE_KEY = "You're not eligible to rate yet. You need to receive a reward from this App to proceed."

export const useCheckAppReviewEligibility = () => {
  const { t } = useTranslation()

  const checkEligibility = useCallback(
    async (appId: string, wallet: string): Promise<boolean> => {
      try {
        const { eligible } = await fetchAppReviewEligibility(appId, wallet)
        if (!eligible) {
          toaster.create({ title: t(NOT_ELIGIBLE_KEY), type: "warning" })
          return false
        }
        return true
      } catch {
        toaster.create({ title: t("Something went wrong!"), type: "error" })
        return false
      }
    },
    [t],
  )

  return { checkEligibility }
}
