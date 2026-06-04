import { UseFormReturn } from "react-hook-form"

import { useCurrentAppScreenshots } from "@/app/apps/[appId]/hooks/useCurrentAppScreenshots"

import { useCurrentAppAdmin } from "../../../../hooks/useCurrentAppAdmin"
import { useCurrentAppBanner } from "../../../../hooks/useCurrentAppBanner"
import { useCurrentAppInfo } from "../../../../hooks/useCurrentAppInfo"
import { useCurrentAppLogo } from "../../../../hooks/useCurrentAppLogo"
import { useCurrentAppMetadata } from "../../../../hooks/useCurrentAppMetadata"
import { EditAppForm } from "../EditAppPageContent"

import { useSocialUrls } from "./useSocialUrls"

export const useIsFormChanged = (form: UseFormReturn<EditAppForm, any, EditAppForm>) => {
  const { logo } = useCurrentAppLogo()
  const { banner } = useCurrentAppBanner()
  const { appMetadata } = useCurrentAppMetadata()
  const { screenshots } = useCurrentAppScreenshots()
  const { app } = useCurrentAppInfo()
  const { admin } = useCurrentAppAdmin()
  const socialUrls = useSocialUrls(form)
  const isLogoChanged = form.watch("logoImage") !== logo
  const isBannerChanged = form.watch("bannerImage") !== banner
  const isNameChanged = form.watch("name") !== appMetadata?.name
  const isAppUrlChanged = form.watch("external_url") !== appMetadata?.external_url
  const isDescriptionChanged = form.watch("description") !== appMetadata?.description
  const isScreenshotsChanged =
    screenshots.length !== form.watch("screenshots").length ||
    screenshots.some((screenshot, index) => screenshot !== form.watch("screenshots")[index])
  const isSocialUrlsChanged =
    socialUrls.some(
      socialUrl => !appMetadata?.social_urls?.find(url => url.name === socialUrl.name && url.url === socialUrl.url),
    ) || socialUrls.length !== appMetadata?.social_urls?.length
  const isVeWorldBannerChanged = form.watch("ve_world_bannerImage") !== appMetadata?.ve_world?.banner
  const isDistributionStrategyChanged =
    form.watch("distribution_strategy") !== appMetadata?.distribution_strategy && !!form.watch("distribution_strategy")
  const isCategoriesChanged = form.watch("categories") !== appMetadata?.categories && !!form.watch("categories")
  const isTutorialVideoChanged = form.watch("tutorialVideo") !== (appMetadata?.tutorial_video ?? "")
  const isTutorialImagesChanged =
    JSON.stringify(form.watch("tutorialImages")) !== JSON.stringify(appMetadata?.tutorial_images ?? [])
  const isWhitepaperChanged = form.watch("whitepaperFile") !== (appMetadata?.whitepaper ?? "")
  const isMoreDetailsEnabledChanged = form.watch("moreDetailsEnabled") !== !!appMetadata?.more_details
  const isTeamBackgroundChanged =
    JSON.stringify(form.watch("teamBackground")) !== JSON.stringify(appMetadata?.more_details?.team_background ?? [])
  const isAppRoadmapChanged =
    form.watch("appRoadmapImage") !== (appMetadata?.more_details?.app_roadmap?.image ?? "") ||
    form.watch("appRoadmapDescription") !== (appMetadata?.more_details?.app_roadmap?.description ?? "")
  const isEcosystemPartnersChanged =
    JSON.stringify(form.watch("ecosystemPartners")) !==
    JSON.stringify(appMetadata?.more_details?.ecosystem_partners ?? [])
  const isTweetLinksChanged =
    JSON.stringify(form.watch("tweetLinks").filter(Boolean)) !== JSON.stringify(appMetadata?.tweets ?? [])
  const badgeSettingsValue = form.watch("badgeSettings")
  const isBadgeSettingsChanged =
    (badgeSettingsValue?.topEcosystemDapp?.isPrivate ?? false) !==
      (appMetadata?.badgeSettings?.topEcosystemDapp?.isPrivate ?? false) ||
    (badgeSettingsValue?.topDistributionPerformer?.isPrivate ?? false) !==
      (appMetadata?.badgeSettings?.topDistributionPerformer?.isPrivate ?? false) ||
    (badgeSettingsValue?.navigatorsPick?.isPrivate ?? false) !==
      (appMetadata?.badgeSettings?.navigatorsPick?.isPrivate ?? false)
  const isTreasuryChanged =
    !!form.watch("treasuryWalletAddress") &&
    form.watch("treasuryWalletAddress").toLowerCase() !== (app?.teamWalletAddress ?? "").toLowerCase()
  const isAdminAddressChanged =
    !!form.watch("adminAddress") && form.watch("adminAddress").toLowerCase() !== (admin ?? "").toLowerCase()
  return (
    isNameChanged ||
    isDescriptionChanged ||
    isAppUrlChanged ||
    isLogoChanged ||
    isBannerChanged ||
    isScreenshotsChanged ||
    isSocialUrlsChanged ||
    isVeWorldBannerChanged ||
    isDistributionStrategyChanged ||
    isCategoriesChanged ||
    isTutorialVideoChanged ||
    isTutorialImagesChanged ||
    isWhitepaperChanged ||
    isMoreDetailsEnabledChanged ||
    isTeamBackgroundChanged ||
    isAppRoadmapChanged ||
    isEcosystemPartnersChanged ||
    isTweetLinksChanged ||
    isBadgeSettingsChanged ||
    isTreasuryChanged ||
    isAdminAddressChanged
  )
}
