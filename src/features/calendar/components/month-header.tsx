"use client";

import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import {
  BS_MONTH_NAMES,
  BS_MONTH_NAMES_NE,
  toDevanagari,
} from "@/lib/formatters/nepali-date";

const MONTH_FORMAT: Intl.DateTimeFormatOptions = {
  month: "short",
  timeZone: "UTC",
};

export function MonthHeader({
  year,
  month,
  from,
  to,
  language,
  onShift,
  onToday,
}: {
  year: number;
  month: number;
  from: Date;
  to: Date;
  language: string;
  onShift: (by: number) => void;
  onToday: () => void;
}) {
  const { t } = useTranslation();

  const title =
    language === "ne"
      ? `${BS_MONTH_NAMES_NE[month - 1]} ${toDevanagari(year)}`
      : `${BS_MONTH_NAMES[month - 1]} ${year}`;

  const range = `${from.toLocaleDateString("en", MONTH_FORMAT)}/${to.toLocaleDateString(
    "en",
    MONTH_FORMAT,
  )} ${to.getUTCFullYear()}`;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-baseline gap-2">
        <h2 className="font-semibold text-2xl">{title}</h2>
        <span className="text-muted-foreground text-sm">
          {t("ui.web.calendar.monthSubtitle", {
            english: BS_MONTH_NAMES[month - 1],
            range,
          })}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={onToday}>
          {t("ui.web.calendar.todayButton")}
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="rounded-full"
          aria-label={t("ui.web.calendar.previous")}
          onClick={() => onShift(-1)}
        >
          <RiArrowLeftSLine />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="rounded-full"
          aria-label={t("ui.web.calendar.next")}
          onClick={() => onShift(1)}
        >
          <RiArrowRightSLine />
        </Button>
      </div>
    </div>
  );
}
