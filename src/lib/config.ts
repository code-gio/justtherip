import type { NavItem, SocialLink } from "$lib/types/nav";
import {
  IconLifebuoy,
  IconSend,
  IconCreditCard,
  IconDashboard,
  IconUser,
  IconPackages,
  IconCards,
  IconWallet,
  IconTruck,
} from "@tabler/icons-svelte";

export const siteConfig = {
  title: "justtherip.gg",
  description: "Jewels-Only Pack Opening Platform",
  logo: "/logo.svg",
  logoDark: "/logo-white.svg",
  favicon: "/favicon.png",
};

export const socialLinks: SocialLink[] = [
  {
    title: "justtherip.gg",
    url: "https://twitter.com/justtherip",
    icon: "twitter",
  },
];

export const navMain = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: IconDashboard,
  },
  {
    title: "Packs",
    url: "/packs",
    icon: IconPackages,
  },
  {
    title: "Inventory",
    url: "/inventory",
    icon: IconCards,
  },
  {
    title: "Wallet",
    url: "/wallet",
    icon: IconWallet,
  },
  {
    title: "Shipments",
    url: "/shipments",
    icon: IconTruck,
  },
];

export const navSecondary: NavItem[] = [
  {
    title: "Support",
    url: "https://support.justtherip.gg",
    icon: IconLifebuoy,
  },
  {
    title: "Feedback",
    url: "https://feedback.justtherip.gg",
    icon: IconSend,
  },
];

export const userNav = [
  {
    title: "Account",
    icon: IconUser,
    url: "/account",
  },
  {
    title: "Billing",
    icon: IconCreditCard,
    url: "/billing",
  },
];
