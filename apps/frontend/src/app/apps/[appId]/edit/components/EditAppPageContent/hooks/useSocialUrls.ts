import { useMemo } from "react"
import { UseFormReturn } from "react-hook-form"

import { EditAppForm } from "../EditAppPageContent"

export const useSocialUrls = (form: UseFormReturn<EditAppForm, any, EditAppForm>) => {
  const twitterUrl = form.watch("twitterUrl")
  const discordUrl = form.watch("discordUrl")
  const telegramUrl = form.watch("telegramUrl")
  const youtubeUrl = form.watch("youtubeUrl")
  const mediumUrl = form.watch("mediumUrl")
  const instagramUrl = form.watch("instagramUrl")
  const socialUrls = useMemo(() => {
    const urls = []
    if (twitterUrl) {
      urls.push({
        name: "Twitter",
        url: twitterUrl,
      })
    }
    if (discordUrl) {
      urls.push({
        name: "Discord",
        url: discordUrl,
      })
    }
    if (telegramUrl) {
      urls.push({
        name: "Telegram",
        url: telegramUrl,
      })
    }
    if (youtubeUrl) {
      urls.push({
        name: "Youtube",
        url: youtubeUrl,
      })
    }
    if (mediumUrl) {
      urls.push({
        name: "Medium",
        url: mediumUrl,
      })
    }
    if (instagramUrl) {
      urls.push({
        name: "Instagram",
        url: instagramUrl,
      })
    }
    return urls
  }, [discordUrl, instagramUrl, mediumUrl, telegramUrl, twitterUrl, youtubeUrl])
  return socialUrls
}
