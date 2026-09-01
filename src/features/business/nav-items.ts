import type { Translate } from "@/features/i18n/types";
import type { Sector } from "./types";

export interface WorkspaceNavItem {
  title: string;
  href: string;
  sectors?: Sector[];
}

const NAV_ITEMS: { key: string; href: string; sectors?: Sector[] }[] = [
  { key: "pos", href: "/pos", sectors: ["mart", "medical"] },
  { key: "tables", href: "/tables", sectors: ["restaurant"] },
  { key: "kitchen", href: "/kitchen", sectors: ["restaurant"] },
  { key: "menu", href: "/menu", sectors: ["restaurant"] },
  { key: "products", href: "/products", sectors: ["mart", "medical"] },
  { key: "batches", href: "/batches", sectors: ["medical"] },
  { key: "purchasing", href: "/purchasing" },
  { key: "invoices", href: "/invoices" },
  { key: "staff", href: "/staff" },
  { key: "settings", href: "/settings" },
];

export function navItemsForSector(
  sector: Sector,
  t: Translate,
): WorkspaceNavItem[] {
  return NAV_ITEMS.filter(
    (item) => !item.sectors || item.sectors.includes(sector),
  ).map((item) => ({
    title: t(`ui.web.nav.${item.key}`),
    href: item.href,
    sectors: item.sectors,
  }));
}
