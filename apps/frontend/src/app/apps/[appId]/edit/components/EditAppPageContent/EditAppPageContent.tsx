import {
  Button,
  Card,
  Grid,
  GridItem,
  HStack,
  Heading,
  Separator,
  SimpleGrid,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react"
import { UilCheck } from "@iconscout/react-unicons"
import { useWallet } from "@vechain/vechain-kit"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import Lottie from "react-lottie"

import { StepModal } from "@/components/StepModal/StepModal"
import { ModalAnimation } from "@/components/TransactionModal/ModalAnimation"
import UploadingMetadataAnimation from "@/lottieAnimations/uploadingMetadata.json"
import { useTransactionModal } from "@/providers/TransactionModalProvider"
import { DEPRECATED_IDS } from "@/types/appDetails"

import { useAccountPermissions } from "../../../../../../api/contracts/account/hooks/useAccountPermissions"
import { CategorySelector } from "../../../../../../components/CategorySelector"
import { SharedAppFormFields } from "../../../../../../components/SharedAppFormFields"
import { SharedWalletAddressFields } from "../../../../../../components/SharedWalletAddressFields"
import { URL_REGEX } from "../../../../../../constants/url"
import { useUpdateAppDetails } from "../../../../../../hooks/xApp/useUpdateAppDetails"
import { useUploadAppMetadata } from "../../../../../../hooks/xApp/useUploadAppMetadata"
import { useCurrentAppAdmin } from "../../../hooks/useCurrentAppAdmin"
import { useCurrentAppBanner } from "../../../hooks/useCurrentAppBanner"
import { useCurrentAppInfo } from "../../../hooks/useCurrentAppInfo"
import { useCurrentAppLogo } from "../../../hooks/useCurrentAppLogo"
import { useCurrentAppMetadata } from "../../../hooks/useCurrentAppMetadata"
import { useCurrentAppRole } from "../../../hooks/useCurrentAppRole"
import { useCurrentAppScreenshots } from "../../../hooks/useCurrentAppScreenshots"
import { useCurrentAppVeWorldBanner } from "../../../hooks/useCurrentAppVeWorldBanner"
import { useCurrentAppVeWorldFeaturedImage } from "../../../hooks/useCurrentAppVeWorldFeaturedImage"

import { AppVersionNotes } from "./components/AppVersionNotes/AppVersionNotes"
import { EditAppBadges } from "./components/EditAppBadges"
import { EditAppBanner } from "./components/EditAppBanner"
import { EditAppLogo } from "./components/EditAppLogo"
import { EditAppSocialUrls } from "./components/EditAppSocialUrls"
import { EditAppTutorial } from "./components/EditAppTutorial"
import { EditAppWhitepaper } from "./components/EditAppWhitepaper"
import { EditMoreAppDetails } from "./components/EditMoreAppDetails"
import { EditScreenshots } from "./components/EditScreenshots"
import { EditSocialMediaUpdates } from "./components/EditSocialMediaUpdates"
import { EditVeWorldBanner } from "./components/EditVeWorldBanner"
import { EditVeWorldFeatureImage } from "./components/EditVeWorldFeatureImage"
import { useIsFormChanged } from "./hooks/useIsFormChanged"
import { useSocialUrls } from "./hooks/useSocialUrls"

const normalizeXLink = (link: string) => (link.startsWith("https://") ? link : `https://x.com/i/web/status/${link}`)

export type EditAppForm = {
  name: string
  external_url: string
  description: string
  distribution_strategy: string
  treasuryWalletAddress: string
  adminAddress: string
  twitterUrl: string
  discordUrl: string
  telegramUrl: string
  youtubeUrl: string
  mediumUrl: string
  instagramUrl: string
  screenshots: string[]
  logoImage: string
  bannerImage: string
  ve_world_bannerImage: string
  ve_world_featured_image: string
  categories: string[]
  tutorialMode: "video" | "image"
  tutorialVideo: string
  tutorialImages: string[]
  whitepaperFile: string
  moreDetailsEnabled: boolean
  teamBackground: { photo: string; title: string; description: string }[]
  appRoadmapImage: string
  appRoadmapDescription: string
  ecosystemPartners: string[]
  tweetLinks: string[]
  badgeSettings: {
    topEcosystemDapp: { isPrivate: boolean }
    topDistributionPerformer: { isPrivate: boolean }
    navigatorsPick: { isPrivate: boolean }
  }
}

enum EditAppPageStep {
  UPLOADING = "UPLOADING",
}

const findUrlByName = (urls: { name: string; url: string }[] | undefined, name: string) => {
  return urls?.find(url => url.name === name)?.url ?? ""
}

export const EditAppPageContent = () => {
  const { t } = useTranslation()
  const { appMetadata } = useCurrentAppMetadata()
  const { logo } = useCurrentAppLogo()
  const { banner } = useCurrentAppBanner()
  const { screenshots } = useCurrentAppScreenshots()
  const { veWorldBanner } = useCurrentAppVeWorldBanner()
  const { veWorldFeaturedImage } = useCurrentAppVeWorldFeaturedImage()
  const router = useRouter()
  const { open: isOpen, onOpen, onClose } = useDisclosure()
  const { isTxModalOpen, onClose: onTxModalClose } = useTransactionModal()
  const { isAdminOrModerator, isAdmin } = useCurrentAppRole()
  const { account } = useWallet()
  const { data: permissions } = useAccountPermissions(account?.address ?? "")
  const { appId } = useParams<{ appId: string }>()
  const { app: currentAppInfo } = useCurrentAppInfo()
  const { admin: currentAdmin } = useCurrentAppAdmin()

  const form = useForm<EditAppForm>({
    defaultValues: {
      screenshots: screenshots,
      logoImage: logo,
      bannerImage: banner,
      name: appMetadata?.name ?? "",
      external_url: appMetadata?.external_url ?? "",
      description: appMetadata?.description ?? "",
      distribution_strategy: appMetadata?.distribution_strategy ?? "",
      treasuryWalletAddress: currentAppInfo?.teamWalletAddress ?? "",
      adminAddress: currentAdmin ?? "",
      twitterUrl: findUrlByName(appMetadata?.social_urls, "Twitter"),
      discordUrl: findUrlByName(appMetadata?.social_urls, "Discord"),
      telegramUrl: findUrlByName(appMetadata?.social_urls, "Telegram"),
      youtubeUrl: findUrlByName(appMetadata?.social_urls, "Youtube"),
      mediumUrl: findUrlByName(appMetadata?.social_urls, "Medium"),
      instagramUrl: findUrlByName(appMetadata?.social_urls, "Instagram"),
      tutorialMode: appMetadata?.tutorial_video ? "video" : "image",
      tutorialVideo: appMetadata?.tutorial_video ?? "",
      tutorialImages: appMetadata?.tutorial_images ?? [],
      ve_world_bannerImage: veWorldBanner,
      ve_world_featured_image: veWorldFeaturedImage,
      categories: (appMetadata?.categories ?? []).filter(id => !DEPRECATED_IDS.includes(id)), // remove the deprecated categories
      whitepaperFile: appMetadata?.whitepaper ?? "",
      moreDetailsEnabled: !!appMetadata?.more_details,
      teamBackground: appMetadata?.more_details?.team_background ?? [],
      appRoadmapImage: appMetadata?.more_details?.app_roadmap?.image ?? "",
      appRoadmapDescription: appMetadata?.more_details?.app_roadmap?.description ?? "",
      ecosystemPartners: appMetadata?.more_details?.ecosystem_partners ?? [],
      tweetLinks: (appMetadata?.tweets ?? []).map(normalizeXLink),
      badgeSettings: {
        topEcosystemDapp: { isPrivate: appMetadata?.badgeSettings?.topEcosystemDapp?.isPrivate ?? false },
        topDistributionPerformer: {
          isPrivate: appMetadata?.badgeSettings?.topDistributionPerformer?.isPrivate ?? false,
        },
        navigatorsPick: { isPrivate: appMetadata?.badgeSettings?.navigatorsPick?.isPrivate ?? false },
      },
    },
  })
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form
  const socialUrls = useSocialUrls(form)
  const isFormChanged = useIsFormChanged(form)

  const goToAppPage = useCallback(() => {
    router.push(`/apps/${appId}`)
  }, [appId, router])

  useEffect(() => {
    if (!isAdminOrModerator && !permissions?.isAdminOfX2EarnApps) {
      goToAppPage()
    }
  }, [isAdminOrModerator, appId, router, permissions, goToAppPage])

  const handleSuccess = useCallback(() => {
    onClose()
    onTxModalClose()
    goToAppPage()
  }, [onClose, onTxModalClose, goToAppPage])

  const updateAppDetailsMutation = useUpdateAppDetails({
    appId,
    onSuccess: handleSuccess,
    onFailure: () => {
      onClose()
    },
  })

  const uploadMetadataMutation = useUploadAppMetadata()

  const uploadMetadata = useCallback(
    async (data: EditAppForm) => {
      const metadataUri = await uploadMetadataMutation.onMetadataUpload({
        name: data.name,
        description: data.description,
        distribution_strategy: data?.distribution_strategy ?? "",
        logo: data.logoImage,
        banner: data.bannerImage,
        external_url: data.external_url,
        screenshots: data.screenshots ?? [],
        app_urls: [],
        social_urls: socialUrls,
        tweets: data.tweetLinks.filter(Boolean),
        categories: data.categories ?? [],
        ve_world: {
          banner: data.ve_world_bannerImage,
          featured_image: data.ve_world_featured_image,
        },
        version_history: appMetadata?.version_history,
        tutorial_video: data.tutorialMode === "video" ? data.tutorialVideo || undefined : undefined,
        tutorial_images:
          data.tutorialMode === "image" && data.tutorialImages.length > 0 ? data.tutorialImages : undefined,
        whitepaper: data.whitepaperFile || undefined,
        more_details: data.moreDetailsEnabled
          ? {
              team_background: data.teamBackground.length > 0 ? data.teamBackground : undefined,
              app_roadmap:
                data.appRoadmapImage || data.appRoadmapDescription
                  ? { image: data.appRoadmapImage, description: data.appRoadmapDescription }
                  : undefined,
              ecosystem_partners: data.ecosystemPartners.length > 0 ? data.ecosystemPartners : undefined,
            }
          : undefined,
        badgeSettings: data.badgeSettings,
      })
      return metadataUri
    },
    [uploadMetadataMutation, socialUrls, appMetadata?.version_history],
  )

  const onSubmit = useCallback(
    async (data: EditAppForm) => {
      onTxModalClose()
      onOpen()

      const metadataUri = await uploadMetadata(data)
      if (!metadataUri) return

      const currentTreasury = currentAppInfo?.teamWalletAddress ?? ""
      const currentAdminAddr = currentAdmin ?? ""
      // Bundle address changes into the same transaction (app admin only, not moderators)
      const treasuryChanged =
        isAdmin &&
        !!data.treasuryWalletAddress &&
        data.treasuryWalletAddress.toLowerCase() !== currentTreasury.toLowerCase()
      const adminChanged =
        isAdmin && !!data.adminAddress && data.adminAddress.toLowerCase() !== currentAdminAddr.toLowerCase()

      updateAppDetailsMutation.sendTransaction({
        metadataUri,
        ...(treasuryChanged ? { teamWalletAddress: data.treasuryWalletAddress } : {}),
        ...(adminChanged ? { adminAddress: data.adminAddress } : {}),
      })
    },
    [updateAppDetailsMutation, onOpen, uploadMetadata, onTxModalClose, isAdmin, currentAppInfo, currentAdmin],
  )

  // Reset all form values once when metadata first loads from blockchain
  const hasResetRef = useRef(false)
  useEffect(() => {
    if (appMetadata && !hasResetRef.current) {
      hasResetRef.current = true
      form.reset({
        name: appMetadata.name ?? "",
        external_url: appMetadata.external_url ?? "",
        description: appMetadata.description ?? "",
        distribution_strategy: appMetadata.distribution_strategy ?? "",
        twitterUrl: findUrlByName(appMetadata.social_urls, "Twitter"),
        discordUrl: findUrlByName(appMetadata.social_urls, "Discord"),
        telegramUrl: findUrlByName(appMetadata.social_urls, "Telegram"),
        youtubeUrl: findUrlByName(appMetadata.social_urls, "Youtube"),
        mediumUrl: findUrlByName(appMetadata.social_urls, "Medium"),
        instagramUrl: findUrlByName(appMetadata.social_urls, "Instagram"),
        tutorialMode: appMetadata.tutorial_video ? "video" : "image",
        tutorialVideo: appMetadata.tutorial_video ?? "",
        tutorialImages: appMetadata.tutorial_images ?? [],
        logoImage: logo || "",
        bannerImage: banner || "",
        screenshots: screenshots.filter(Boolean),
        ve_world_bannerImage: veWorldBanner || "",
        ve_world_featured_image: veWorldFeaturedImage || "",
        categories: (appMetadata.categories ?? []).filter(id => !DEPRECATED_IDS.includes(id)),
        whitepaperFile: appMetadata.whitepaper ?? "",
        moreDetailsEnabled: !!appMetadata.more_details,
        teamBackground: appMetadata.more_details?.team_background ?? [],
        appRoadmapImage: appMetadata.more_details?.app_roadmap?.image ?? "",
        appRoadmapDescription: appMetadata.more_details?.app_roadmap?.description ?? "",
        ecosystemPartners: appMetadata.more_details?.ecosystem_partners ?? [],
        tweetLinks: (appMetadata.tweets ?? []).map(normalizeXLink),
        badgeSettings: {
          topEcosystemDapp: { isPrivate: appMetadata.badgeSettings?.topEcosystemDapp?.isPrivate ?? false },
          topDistributionPerformer: {
            isPrivate: appMetadata.badgeSettings?.topDistributionPerformer?.isPrivate ?? false,
          },
          navigatorsPick: { isPrivate: appMetadata.badgeSettings?.navigatorsPick?.isPrivate ?? false },
        },
      })
    }
  }, [appMetadata, logo, banner, screenshots, veWorldBanner, veWorldFeaturedImage, form])

  // Update async-loaded images individually (they may arrive after metadata)
  useEffect(() => {
    if (!hasResetRef.current) return
    if (logo) form.setValue("logoImage", logo)
    if (banner) form.setValue("bannerImage", banner)
    if (veWorldBanner) form.setValue("ve_world_bannerImage", veWorldBanner)
    if (veWorldFeaturedImage) form.setValue("ve_world_featured_image", veWorldFeaturedImage)
  }, [logo, banner, veWorldBanner, veWorldFeaturedImage, form])

  // Sync treasury/admin addresses once blockchain data resolves
  useEffect(() => {
    if (currentAppInfo?.teamWalletAddress) form.setValue("treasuryWalletAddress", currentAppInfo.teamWalletAddress)
  }, [currentAppInfo?.teamWalletAddress, form])
  useEffect(() => {
    if (currentAdmin) form.setValue("adminAddress", currentAdmin)
  }, [currentAdmin, form])

  // Sync screenshots separately to avoid new-array-reference triggering reset
  const screenshotsKey = screenshots.filter(Boolean).join(",")
  useEffect(() => {
    if (!hasResetRef.current) return
    const valid = screenshots.filter(Boolean)
    if (valid.length > 0 && form.getValues("screenshots").filter(Boolean).length === 0) {
      form.setValue("screenshots", valid)
    }
  }, [screenshotsKey, form, screenshots])

  if (!isAdminOrModerator && !permissions?.isAdminOfX2EarnApps) {
    return null
  }

  return (
    <>
      <StepModal
        isOpen={isOpen && !isTxModalOpen}
        onClose={onClose}
        disableCloseButton={true}
        steps={[
          {
            key: EditAppPageStep.UPLOADING,
            content: (
              <ModalAnimation>
                <VStack align={"center"} p={6}>
                  {/* @ts-ignore eslint-disable-line */}
                  <Lottie
                    style={{
                      pointerEvents: "none",
                    }}
                    options={{
                      loop: true,
                      autoplay: true,
                      animationData: UploadingMetadataAnimation,
                    }}
                    height={200}
                    width={200}
                  />
                </VStack>
              </ModalAnimation>
            ),
            title: "Upload metadata",
            description: "Please wait while we upload the metadata",
          },
        ]}
        activeStep={0}
        setActiveStep={() => {}}
        goToPrevious={() => {}}
      />
      <Grid templateColumns="repeat(3, 1fr)" gap={[4, 4, 8]} w="full" as="form" onSubmit={handleSubmit(onSubmit)}>
        <GridItem colSpan={[3, 3, 2]}>
          <Card.Root>
            <Card.Header>
              <Heading size="3xl">{t("Edit the App")}</Heading>
            </Card.Header>
            <Card.Body>
              <VStack gap={8} w="full">
                <SharedAppFormFields
                  name={{
                    register: register("name", {
                      required: { value: true, message: t("Name required") },
                      minLength: { value: 3, message: t("Name must be at least 3 characters") },
                    }),
                    error: errors.name?.message,
                  }}
                  description={{
                    register: register("description", {
                      required: { value: true, message: t("Description required") },
                      minLength: { value: 20, message: t("Description must be at least 20 characters") },
                    }),
                    error: errors.description?.message,
                  }}
                  url={{
                    register: register("external_url", {
                      required: { value: true, message: t("Project url required") },
                      pattern: {
                        value: URL_REGEX,
                        message: t("Invalid url"),
                      },
                    }),
                    error: errors.external_url?.message,
                  }}
                  distribution={{
                    register: register("distribution_strategy", {
                      required: t("Distribution Strategy is required"),
                      minLength: {
                        value: 20,
                        message: t("{{fieldName}} is too short", { fieldName: t("Distribution Strategy") }),
                      },
                    }),
                    error: errors.distribution_strategy?.message,
                  }}
                />

                {/* CategorySelector is generic and works with any RHF form type */}
                <CategorySelector
                  fieldName="categories"
                  register={register}
                  setValue={setValue}
                  watch={watch}
                  registerOptions={{
                    required: { value: true, message: t("Categories are required") },
                  }}
                  error={errors.categories?.message}
                />

                {/* Treasury and Admin address — contract enforces onlyRoleAndAppAdmin; inputs disabled for non-admins */}
                <SharedWalletAddressFields
                  treasury={{
                    value: watch("treasuryWalletAddress"),
                    onAddressResolved: address => setValue("treasuryWalletAddress", address ?? ""),
                    disabled: !isAdmin,
                  }}
                  admin={{
                    value: watch("adminAddress"),
                    onAddressResolved: address => setValue("adminAddress", address ?? ""),
                    disabled: !isAdmin,
                  }}
                />

                <SimpleGrid columns={[1, 2]} gap={4} w="full">
                  <EditAppLogo form={form} />
                  <EditAppBanner form={form} />
                </SimpleGrid>

                <EditAppSocialUrls form={form} />

                <Separator />
                <EditScreenshots form={form} />
                <Separator />
                <EditAppTutorial form={form} />
                <Separator />
                <EditAppWhitepaper form={form} />
                <Separator />
                <EditMoreAppDetails form={form} />
                <Separator />

                <VStack align={"flex-start"} gap={4}>
                  <Heading size="2xl">{t("VeWorld assets")}</Heading>
                  <Text textStyle="sm" color={"gray"} pt={0}>
                    {t(
                      "VeWorld assets are used to display the app in the VeWorld mobile wallet. Include them to make your app more engaging. ✨",
                    )}
                  </Text>
                  <HStack gap={4} w="full" align={"stretch"}>
                    <EditVeWorldBanner form={form} />
                    <EditVeWorldFeatureImage form={form} />
                  </HStack>
                </VStack>
              </VStack>
            </Card.Body>
            <Card.Footer display={"flex"} flexDir={"column"} w="full" mt={4}>
              <HStack justifyContent="flex-end">
                <Button variant="ghost" color="status.negative.primary" onClick={goToAppPage}>
                  {t("Cancel")}
                </Button>
                <Button variant="primary" type="submit" disabled={!isFormChanged}>
                  <UilCheck size="16px" />
                  {t("Save changes")}
                </Button>
              </HStack>
            </Card.Footer>
          </Card.Root>
        </GridItem>

        <GridItem colSpan={[3, 3, 1]}>
          <VStack gap={4} w="full" align={"flex-start"} position="sticky" top={100} right={0}>
            <EditAppBadges form={form} />
            <EditSocialMediaUpdates form={form} />
            <AppVersionNotes appId={appId} currentMetadata={appMetadata} />
          </VStack>
        </GridItem>
      </Grid>
    </>
  )
}
