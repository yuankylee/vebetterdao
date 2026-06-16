import { Box, Image } from "@chakra-ui/react"
import { useTranslation } from "react-i18next"

import { BADGE_CONFIGS } from "@/api/badges/badgeConfigs"
import { BadgeKey } from "@/api/badges/types"

type Props = {
  badgeKey: BadgeKey
  earned: boolean
  rank: number | null
  onClick: () => void
  size?: "sm" | "md"
}

export const BadgeIcon = ({ badgeKey, earned, rank, onClick, size = "sm" }: Props) => {
  const { t } = useTranslation()
  const config = BADGE_CONFIGS.find(b => b.key === badgeKey)!
  const boxSize = size === "md" ? "80px" : "64px"
  const bottom = size === "md" ? "6px" : "4px"
  const fontSize = size === "md" ? "14px" : "11px"

  return (
    <Box
      position="relative"
      display="inline-flex"
      flexShrink={0}
      cursor="pointer"
      onClick={onClick}
      _hover={{ opacity: 0.85 }}
      transition="opacity 0.15s">
      <Image
        flex={1}
        src={size === "md" && !earned ? config.greyImage : config.image}
        alt={t(config.title)}
        boxSize={boxSize}
        objectFit="contain"
        filter={earned ? undefined : "grayscale(1) opacity(0.35)"}
      />
      {earned && rank != null && (
        <Box
          position="absolute"
          bottom={bottom}
          left="50%"
          transform="translateX(-50%)"
          color="white"
          fontSize={fontSize}
          fontWeight="bold"
          lineHeight="18px"
          whiteSpace="nowrap">
          {rank}
        </Box>
      )}
    </Box>
  )
}
