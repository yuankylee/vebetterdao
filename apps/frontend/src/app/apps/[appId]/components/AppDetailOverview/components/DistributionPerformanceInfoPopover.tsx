"use client"

import { Box, Heading, HStack, Icon, Text, VStack } from "@chakra-ui/react"
import { useTranslation } from "react-i18next"
import { LuInfo } from "react-icons/lu"

import { Tooltip } from "@/components/ui/tooltip"

const distributionHelpContent = (t: (key: string) => string) => (
  <VStack align="stretch" gap={3} textStyle="sm">
    <Text color="text.subtle">
      <Text as="span" fontWeight="semibold" color="text.default">
        {t("Distribution Performance")}
        {": "}
      </Text>
      {t("Percentage of B3TR rewards distributed to users relative to the allocation received.")}
    </Text>
    <Text color="text.subtle">
      <Text as="span" fontWeight="semibold" color="text.default">
        {t("Allocation Earnings")}
        {": "}
      </Text>
      {t("Allocation received by the dApps from VeBetterDAO based on voting results from previous weeks.")}
    </Text>
    <Text color="text.subtle">
      <Text as="span" fontWeight="semibold" color="text.default">
        {t("B3TR Distributed")}
        {": "}
      </Text>
      {t("The amount of B3TR rewards distributed to users.")}
    </Text>
  </VStack>
)

/**
 * Info icon + hover tooltip copy for Distribution Performance (card header).
 */
export const DistributionPerformanceInfoPopover = () => {
  const { t } = useTranslation()

  return (
    <Tooltip
      content={distributionHelpContent(t)}
      positioning={{ placement: "bottom-start" }}
      showArrow={false}
      contentProps={{
        maxW: "sm",
        p: 3,
        textAlign: "left",
        bg: "bg.primary",
        color: "text.default",
        borderWidth: "1px",
        borderColor: "border.primary",
        boxShadow: "lg",
      }}>
      <Box
        as="span"
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        color="text.subtle"
        flexShrink={0}
        cursor="pointer"
        lineHeight={1}
        aria-label={t("Distribution performance chart help")}>
        <Icon as={LuInfo} boxSize={5} />
      </Box>
    </Tooltip>
  )
}

/** Title + info icon row for the rewards / distribution performance card header. */
export const DistributionPerformanceTitleRow = () => {
  const { t } = useTranslation()

  return (
    <HStack gap={2} align="center" flexWrap="wrap" minW={0}>
      <Heading size="xl" mb={0}>
        {t("Distribution Performance")}
      </Heading>
      <DistributionPerformanceInfoPopover />
    </HStack>
  )
}
