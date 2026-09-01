import type { Translate } from "@/features/i18n/types";

export function tableStatusLabel(status: string, t: Translate): string {
  const key =
    status === "occupied"
      ? "tableOccupied"
      : status === "billed"
        ? "tableBilled"
        : "tableEmpty";

  return t(`ui.web.restaurant.${key}`);
}

export const TABLE_STATUS_VARIANTS = {
  occupied: "default",
  billed: "secondary",
  empty: "outline",
} as const;

export const NEXT_KITCHEN_STATUS: Record<
  string,
  { status: string; labelKey: string } | undefined
> = {
  in_kitchen: {
    status: "preparing",
    labelKey: "ui.web.restaurant.startPreparing",
  },
  preparing: { status: "ready", labelKey: "ui.web.restaurant.markReady" },
  ready: { status: "served", labelKey: "ui.web.restaurant.markServed" },
};

export const KITCHEN_POLL_INTERVAL_MS = 10_000;
