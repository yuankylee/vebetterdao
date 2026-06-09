"use client"

import { Box, Heading, HStack, Icon, Text, VStack } from "@chakra-ui/react"
import { useTranslation } from "react-i18next"
import { LuInfo } from "react-icons/lu"

import { Tooltip } from "@/components/ui/tooltip"

const userStatsHelpContent = (t: (key: string) => string) => (
  <VStack align="stretch" gap={3} textStyle="sm">
    <Text color="text.subtle">
      <Text as="span" fontWeight="semibold" color="text.default">
        {t("Total Users")}
        {": "}
      </Text>
      {t("Total users statistics definition")}
    </Text>
    <Text color="text.subtle">
      <Text as="span" fontWeight="semibold" color="text.default">
        {t("Active Users")}
        {": "}
      </Text>
      {t("Active users statistics definition")}
    </Text>
    <Text color="text.subtle">
      <Text as="span" fontWeight="semibold" color="text.default">
        {t("New Users")}
        {": "}
      </Text>
      {t("New users statistics definition")}
    </Text>
  </VStack>
)

export const UserStatisticsInfoTip = () => {
  const { t } = useTranslation()

  return (
    <Tooltip
      content={userStatsHelpContent(t)}
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
        cursor="help"
        lineHeight={1}
        aria-label={t("User statistics chart help")}>
        <Icon as={LuInfo} boxSize={5} />
      </Box>
    </Tooltip>
  )
}

export const UserStatisticsTitleRow = () => {
  const { t } = useTranslation()

  return (
    <HStack gap={2} align="center" flexWrap="wrap" minW={0}>
      <Heading size="xl" mb={0}>
        {t("User Statistics")}
      </Heading>
      <UserStatisticsInfoTip />
    </HStack>
  )
}
