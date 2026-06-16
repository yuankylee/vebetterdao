const notFoundImage = "/assets/images/image-not-found.webp"
import {
  Button,
  Card,
  Grid,
  GridItem,
  HStack,
  Heading,
  Image,
  Link,
  Skeleton,
  Stack,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react"
import { UilArrowUpRight, UilDownloadAlt, UilExternalLinkAlt } from "@iconscout/react-unicons"
import dayjs from "dayjs"
import { useCallback, useMemo } from "react"
import { useTranslation } from "react-i18next"

import { useAppEarnings } from "@/api/indexer/xallocations/useAppEarnings"
import { convertUriToUrl } from "@/utils/uri"

import { XAppStatus } from "../../../../../types/appDetails"
import { useCurrentAppBanner } from "../../hooks/useCurrentAppBanner"
import { useCurrentAppInfo } from "../../hooks/useCurrentAppInfo"
import { useCurrentAppLogo } from "../../hooks/useCurrentAppLogo"
import { useCurrentAppMetadata } from "../../hooks/useCurrentAppMetadata"
import { EndorsementStatusCallout } from "../AppEndorsementInfoCard/EndorsementStatusCallout"

import { AdminAppPageButton } from "./components/AdminAppPageButton"
import { AppDetailSocials } from "./components/AppDetailSocials"
import { AppScoreCard } from "./components/AppScoreCard"
import { EditAppPageButton } from "./components/EditAppPageButton"
import { MoreAppDetailsModal } from "./components/MoreAppDetailsModal"
export const AppDetailOverview = ({
  endorsementStatus,
  isEndorsementStatusLoading,
}: {
  endorsementStatus: XAppStatus
  isEndorsementStatusLoading: boolean
}) => {
  const { t } = useTranslation()
  const { open: isMoreDetailsOpen, onOpen: onOpenMoreDetails, onClose: onCloseMoreDetails } = useDisclosure()
  const { app } = useCurrentAppInfo()
  const { appMetadata, appMetadataLoading, appMetadataError } = useCurrentAppMetadata()
  const { logo, isLogoLoading } = useCurrentAppLogo()
  const { banner, isBannerLoading } = useCurrentAppBanner()
  const { data: earningsData } = useAppEarnings(app?.id ?? "")
  const firstRoundId = useMemo(() => {
    if (!earningsData || !Array.isArray(earningsData) || earningsData.length === 0) return undefined
    return Math.min(...earningsData.map(e => e.roundId))
  }, [earningsData])

  const goToWebsite = useCallback(() => {
    if (appMetadata?.external_url) {
      window.open(appMetadata.external_url, "_blank")
    }
  }, [appMetadata?.external_url])

  const downloadWhitepaper = useCallback(() => {
    if (appMetadata?.whitepaper) {
      window.open(convertUriToUrl(appMetadata.whitepaper), "_blank")
    }
  }, [appMetadata?.whitepaper])

  return (
    <>
      <MoreAppDetailsModal isOpen={isMoreDetailsOpen} onClose={onCloseMoreDetails} />
      <VStack gap={4} align="stretch">
        <Card.Root variant="primary">
          <Card.Body>
            <VStack align="stretch" gap={6}>
              <Skeleton loading={isBannerLoading}>
                <Image
                  src={banner ?? notFoundImage}
                  alt={"banner"}
                  borderRadius="24px"
                  w={"full"}
                  objectFit={"cover"}
                  objectPosition="center"
                  h={{ base: "180px", md: "220px" }}
                />
              </Skeleton>
              <Grid
                templateColumns={["1fr", "1fr", "minmax(0, 2fr) minmax(0, 1fr)"]}
                gap={6}
                w="full"
                alignItems="stretch">
                <GridItem colSpan={[1, 1, 1]}>
                  <VStack alignItems={"stretch"} gap={6} w="full">
                    {/* Header row: Logo+Name+Badge (left) | Social+Edit+Admin (right) */}
                    <HStack justify={"space-between"} flexWrap={"wrap"} gap={4} align="flex-start">
                      <HStack gap={4} align="flex-start">
                        <Skeleton loading={isLogoLoading} alignContent={"start"}>
                          <Image src={logo ?? notFoundImage} alt={"logo"} boxSize={"64px"} borderRadius="16px" />
                        </Skeleton>
                        <Stack gap={1}>
                          <Skeleton loading={appMetadataLoading && !!appMetadata}>
                            <Heading size="3xl">
                              {appMetadata?.name ?? appMetadataError?.message ?? "Error loading name"}
                            </Heading>
                          </Skeleton>
                          <Skeleton loading={isEndorsementStatusLoading}>
                            <EndorsementStatusCallout
                              endorsementStatus={endorsementStatus}
                              showDescription={false}
                              padding={1}
                              boxSize={4}
                              textStyle="sm"></EndorsementStatusCallout>
                          </Skeleton>
                        </Stack>
                      </HStack>
                      <HStack gap={2}>
                        <AppDetailSocials socialUrls={appMetadata?.social_urls || []} />
                        <EditAppPageButton />
                        <AdminAppPageButton />
                      </HStack>
                    </HStack>

                    {/* Description + More link */}
                    <Stack gap={2} mt={2}>
                      <Skeleton loading={appMetadataLoading || !appMetadata}>
                        <Text textStyle={"md"}>
                          {appMetadata?.description ?? appMetadataError?.message ?? "Error loading description"}
                        </Text>
                      </Skeleton>
                      <Link
                        textStyle="md"
                        mt={8}
                        fontWeight="normal"
                        color="actions.secondary.text-lighter"
                        onClick={onOpenMoreDetails}>
                        {t("More")}
                        <UilArrowUpRight />
                      </Link>
                    </Stack>

                    {/* Bottom row: Member since | Whitepaper + Go to Website */}
                    <Stack
                      borderTopWidth="1px"
                      borderTopStyle="solid"
                      borderColor="#F1F2F3"
                      flexDirection={["column", "column", "row"]}
                      justify={"space-between"}
                      align={"left"}
                      pt={6}
                      w="full">
                      {app?.createdAtTimestamp && app.createdAtTimestamp !== "0" && (
                        <VStack align="stretch">
                          <Text textStyle={"sm"} color="text.subtle">
                            {t("Member since")}
                          </Text>
                          <HStack>
                            <Text textStyle={"md"}>
                              {dayjs.unix(Number(app.createdAtTimestamp)).format("MMM D, YYYY")}
                            </Text>
                            {firstRoundId != null && (
                              <Text textStyle={"md"}>
                                {"("}
                                {t("Round #{{round}}", { round: firstRoundId.toString() })}
                                {")"}
                              </Text>
                            )}
                          </HStack>
                        </VStack>
                      )}
                      <HStack gap={3} w={{ base: "full", md: "auto" }} mt={{ base: 4, md: 0 }}>
                        {appMetadata?.whitepaper && (
                          <Button variant={"secondary"} onClick={downloadWhitepaper} w={{ base: "full", md: "auto" }}>
                            {t("Whitepaper")}
                            <UilDownloadAlt color="currentColor" size={"16px"} />
                          </Button>
                        )}
                        <Button variant={"primary"} onClick={goToWebsite} w={{ base: "full", md: "auto" }}>
                          {t("Go to Website")}
                          <UilExternalLinkAlt color="white" size={"16px"} />
                        </Button>
                      </HStack>
                    </Stack>
                  </VStack>
                </GridItem>
                <GridItem colSpan={[1, 1, 1]}>
                  <AppScoreCard />
                </GridItem>
              </Grid>
            </VStack>
          </Card.Body>
        </Card.Root>
      </VStack>
    </>
  )
}
