"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/composed/empty-state";
import { PageHeader } from "@/components/composed/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurrentBusiness } from "@/features/business/business-provider";
import { Can } from "@/features/business/components/can";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import {
  BS_MONTH_NAMES,
  bsMonthGrid,
  bsMonthWindow,
  shiftBsMonth,
  toBs,
  toDevanagari,
} from "@/lib/formatters/nepali-date";
import { useLanguageStore } from "@/stores/language-store";
import { EventDialog } from "../components/event-dialog";
import { MonthGrid } from "../components/month-grid";
import { calendarFeedQueryOptions } from "../queries";
import type { CalendarEntry, CalendarScope } from "../types";

const SCOPE_VARIANT: Record<
  CalendarScope,
  "default" | "secondary" | "outline"
> = {
  organisation: "default",
  branch: "secondary",
  personal: "outline",
};

type Mode = "bs" | "ad";
type Layout = "grid" | "list";

function adMonthWindow(anchor: Date): { from: Date; to: Date } {
  const from = new Date(
    Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), 1),
  );

  return {
    from,
    to: new Date(
      Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() + 1, 1) - 1,
    ),
  };
}

function groupByDay(entries: CalendarEntry[]): [string, CalendarEntry[]][] {
  const byDay = new Map<string, CalendarEntry[]>();

  for (const entry of entries) {
    const day = entry.date.ad;
    byDay.set(day, [...(byDay.get(day) ?? []), entry]);
  }

  return [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b));
}

export function CalendarView() {
  const { t } = useTranslation();
  const language = useLanguageStore((state) => state.language);

  const business = useCurrentBusiness();
  const [mode, setMode] = useState<Mode>("bs");
  const [adAnchor, setAdAnchor] = useState(() => new Date());
  const [bsAnchor, setBsAnchor] = useState(() => {
    const now = toBs(new Date());
    return { year: now.year, month: now.month };
  });
  const [adding, setAdding] = useState(false);
  const [layout, setLayout] = useState<Layout>("grid");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const window = useMemo(
    () =>
      mode === "bs"
        ? bsMonthWindow(bsAnchor.year, bsAnchor.month)
        : adMonthWindow(adAnchor),
    [mode, bsAnchor, adAnchor],
  );

  const { data: entries, isFetching } = useQuery(
    calendarFeedQueryOptions(
      business?.id ?? "",
      window.from.toISOString(),
      window.to.toISOString(),
    ),
  );

  const grouped = useMemo(() => groupByDay(entries ?? []), [entries]);

  const entriesByDay = useMemo(() => new Map(grouped), [grouped]);

  const weeks = useMemo(
    () => bsMonthGrid(bsAnchor.year, bsAnchor.month),
    [bsAnchor],
  );

  const selectedEntries = selectedDay
    ? (entriesByDay.get(selectedDay) ?? [])
    : [];

  if (!business) {
    return null;
  }

  const shift = (by: number) => {
    if (mode === "bs") {
      setBsAnchor(shiftBsMonth(bsAnchor.year, bsAnchor.month, by));
      return;
    }

    setAdAnchor(
      new Date(
        Date.UTC(adAnchor.getUTCFullYear(), adAnchor.getUTCMonth() + by, 1),
      ),
    );
  };

  const label =
    mode === "bs"
      ? `${BS_MONTH_NAMES[bsAnchor.month - 1]} ${bsAnchor.year}`
      : adAnchor.toLocaleDateString(undefined, {
          month: "long",
          year: "numeric",
          timeZone: "UTC",
        });

  const subLabel =
    mode === "bs"
      ? `${window.from.toISOString().slice(0, 10)} — ${window.to
          .toISOString()
          .slice(0, 10)}`
      : "";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("ui.web.calendar.title")}
        description={t("ui.web.calendar.description")}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={layout === "grid" ? "default" : "outline"}
                onClick={() => setLayout("grid")}
              >
                {t("ui.web.calendar.grid")}
              </Button>
              <Button
                size="sm"
                variant={layout === "list" ? "default" : "outline"}
                onClick={() => setLayout("list")}
              >
                {t("ui.web.calendar.list")}
              </Button>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={mode === "bs" ? "default" : "outline"}
                onClick={() => setMode("bs")}
              >
                {t("ui.web.calendar.calendarBs")}
              </Button>
              <Button
                size="sm"
                variant={mode === "ad" ? "default" : "outline"}
                onClick={() => setMode("ad")}
              >
                {t("ui.web.calendar.calendarAd")}
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={() => shift(-1)}>
              {t("ui.web.calendar.previous")}
            </Button>
            <div className="flex min-w-44 flex-col items-center">
              <span className="font-medium text-sm">{label}</span>
              {subLabel && (
                <span className="text-muted-foreground text-xs tabular-nums">
                  {subLabel}
                </span>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => shift(1)}>
              {t("ui.web.calendar.next")}
            </Button>
            <Can permission={{ calendar: ["manage"] }}>
              <Button onClick={() => setAdding(true)}>
                {t("ui.web.calendar.add")}
              </Button>
            </Can>
          </div>
        }
      />

      {layout === "grid" && mode === "bs" ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
          <MonthGrid
            weeks={weeks}
            entriesByDay={entriesByDay}
            language={language}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
          />

          <div className="flex flex-col gap-3 rounded-lg border p-4">
            {selectedDay ? (
              <>
                <span className="font-medium text-sm">
                  {language === "ne"
                    ? (entriesByDay.get(selectedDay)?.[0]?.date.bsNepali ??
                      toDevanagari(selectedDay))
                    : (entriesByDay.get(selectedDay)?.[0]?.date.bsLong ??
                      selectedDay)}
                </span>
                <span className="text-muted-foreground text-xs tabular-nums">
                  {selectedDay}
                </span>

                {selectedEntries.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    {t("ui.web.calendar.empty")}
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {selectedEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex flex-col gap-1 rounded-lg border p-2"
                      >
                        <span className="text-sm">{entry.title}</span>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant={SCOPE_VARIANT[entry.scope]}>
                            {t(`ui.web.calendar.${entry.scope}`)}
                          </Badge>
                          {entry.source !== "event" && (
                            <Badge variant="outline">
                              {t(`ui.web.calendar.${entry.source}`)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground text-sm">
                {t("ui.web.calendar.noPanchang")}
              </p>
            )}
          </div>
        </div>
      ) : !isFetching && grouped.length === 0 ? (
        <EmptyState
          title={t("ui.web.calendar.empty")}
          description={t("ui.web.calendar.emptyHint")}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {grouped.map(([day, dayEntries]) => {
            const date = dayEntries[0].date;

            return (
              <div key={day} className="flex gap-4">
                <div className="flex w-40 shrink-0 flex-col pt-1">
                  <span className="font-medium text-sm">
                    {language === "ne" ? date.bsNepali : date.bsLong}
                  </span>
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {new Date(`${date.ad}T00:00:00Z`).toLocaleDateString(
                      undefined,
                      {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        timeZone: "UTC",
                      },
                    )}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  {dayEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center gap-3 rounded-lg border p-3"
                    >
                      <span className="w-14 shrink-0 text-muted-foreground text-xs tabular-nums">
                        {entry.allDay
                          ? "\u2014"
                          : new Date(entry.startsAt).toLocaleTimeString(
                              undefined,
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                      </span>
                      <span className="flex-1 truncate text-sm">
                        {entry.title}
                      </span>
                      {entry.source !== "event" && (
                        <Badge variant="outline">
                          {t(`ui.web.calendar.${entry.source}`)}
                        </Badge>
                      )}
                      <Badge variant={SCOPE_VARIANT[entry.scope]}>
                        {t(`ui.web.calendar.${entry.scope}`)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <EventDialog
        businessId={business.id}
        open={adding}
        onOpenChange={setAdding}
      />
    </div>
  );
}
