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
  IconUsers,
  IconAdjustments,
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
    title: "Packs",
    url: "/packs",
    icon: IconPackages,
  },
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: IconDashboard,
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

export const adminNav: NavItem[] = [
  {
    title: "Admin Dashboard",
    url: "/admin",
    icon: IconDashboard,
  },
  {
    title: "Manage Packs",
    url: "/admin/packs",
    icon: IconPackages,
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
    icon: IconAdjustments,
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
