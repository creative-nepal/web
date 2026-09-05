"use client";

import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import type { CalendarEntry, CalendarScope } from "../types";

export const SCOPE_VARIANT: Record<
  CalendarScope,
  "default" | "secondary" | "outline"
> = {
  organisation: "default",
  branch: "secondary",
  personal: "outline",
};

export function ScopeBadges({ entry }: { entry: CalendarEntry }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap gap-1">
      <Badge variant={SCOPE_VARIANT[entry.scope]}>
        {t(`ui.web.calendar.${entry.scope}`)}
      </Badge>
      {entry.source !== "event" && (
        <Badge variant="outline">{t(`ui.web.calendar.${entry.source}`)}</Badge>
      )}
    </div>
  );
}
