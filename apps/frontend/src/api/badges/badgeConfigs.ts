import { BadgeKey } from "./types"

export type BadgeConfig = {
  key: BadgeKey
  title: string
  description: string
  image: string
  greyImage: string
  imageBg: string
}

export const BADGE_CONFIGS: BadgeConfig[] = [
  {
    key: "topEcosystemDapp",
    title: "Top Ecosystem Dapp",
    description:
      "Top Ecosystem dApp is an honorary badge exclusively for top-rated applications. It is minted for outstanding projects that rank in the top 10% of app ratings in each round. The moment each round's ratings are finalized is the moment of glory.",
    image: "/assets/images/badges/badge-top-ecosystem.png",
    greyImage: "/assets/images/badges/badge-top-ecosystem-grey.png",
    imageBg: "/assets/images/badges/badge-bg.webp",
  },
  {
    key: "topDistributionPerformer",
    title: "Top Distribution Performer",
    description:
      "Top Distribution Performer is awarded to dApps that excel in reward distribution efficiency. It is minted for projects that demonstrate outstanding token distribution performance within the top 10% of all apps in each round.",
    image: "/assets/images/badges/badge-top-distribution.png",
    greyImage: "/assets/images/badges/badge-top-distribution-grey.png",
    imageBg: "/assets/images/badges/badge-bg.webp",
  },
  {
    key: "navigatorsPick",
    title: "Navigators' Pick",
    description:
      "Navigators' Pick is a community-curated badge awarded by VeBetterDAO Navigators. It recognizes dApps that stand out for innovation, user experience, and positive ecosystem contribution as chosen by community leaders.",
    image: "/assets/images/badges/badge-nav-choice.png",
    greyImage: "/assets/images/badges/badge-nav-choice-grey.png",
    imageBg: "/assets/images/badges/badge-bg.webp",
  },
]
