import type { NavItem, SocialLink } from "$lib/types/nav";
import {
  IconLifebuoy,
  IconList,
  IconCreditCard,
  IconDashboard,
  IconUser,
  IconPackages,
  IconCards,
  IconWallet,
  IconTruck,
  IconUsers,
  IconAdjustments,
  IconCoin,
  IconChartLine,
  IconSettings,
  IconReceipt,
  IconFolder,
  IconSparkles,
} from "@tabler/icons-svelte";

export const siteConfig = {
  title: "justtherip.gg",
  description: "Jewels-Only Pack Opening Platform",
  logo: "/logo.svg",
  logoDark: "/logo.svg",
  favicon: "/favicon.png",
  ripToUsd: 1.0,
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
    title: "Decks",
    url: "/decks",
    icon: IconFolder,
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

export const adminNav: NavItem[] = [
  {
    title: "Admin Dashboard",
    url: "/admin",
    icon: IconDashboard,
  },
  {
    title: "Analytics",
    url: "/admin/analytics",
    icon: IconChartLine,
  },
  {
    title: "Transactions",
    url: "/admin/transactions",
    icon: IconReceipt,
  },
  {
    title: "Manage Packs",
    url: "/admin/packs",
    icon: IconPackages,
  },
  {
    title: "Simulator",
    url: "/admin/simulator",
    icon: IconSparkles,
  },
  {
    title: "Card Catalog",
    url: "/admin/cards",
    icon: IconCards,
  },
  {
    title: "Fulfillment",
    url: "/admin/fulfillment",
    icon: IconTruck,
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: IconUsers,
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: IconSettings,
  },
];

export const navSecondary: NavItem[] = [
  {
    title: "Support",
    url: "https://justtherip.featurebase.app/help",
    icon: IconLifebuoy,
  },
  {
    title: "Roadmap",
    url: "https://justtherip.featurebase.app/roadmap",
    icon: IconList,
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
