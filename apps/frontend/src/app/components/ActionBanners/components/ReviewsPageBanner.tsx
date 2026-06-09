import { Button } from "@chakra-ui/react"
import { useTranslation } from "react-i18next"

import { GenericBanner } from "@/app/components/Banners/GenericBanner"

export const ReviewsPageBanner = ({ onClick }: { onClick: () => void }) => {
  const { t } = useTranslation()

  return (
    <>
      <GenericBanner
        title={t("Reviews")}
        illustration="/assets/mascot/mascot-data.png"
        description={t(
          "Welcome to share your experience or valuable suggestions in the comments section below. Every voice you share helps make this DApp more user-friendly and better.",
        )}
        cta={
          <Button size={{ base: "sm", md: "md" }} variant="primary" onClick={() => onClick()}>
            {t("Write a Review")}
          </Button>
        }
      />
    </>
  )
}
