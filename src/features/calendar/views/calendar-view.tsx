"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/composed/empty-state";
import { PageHeader } from "@/components/composed/page-header";
import { Button } from "@/components/ui/button";
import { useCurrentBusiness } from "@/features/business/business-provider";
import { Can } from "@/features/business/components/can";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import {
  BS_MONTH_NAMES,
  bsMonthGrid,
  bsMonthWindow,
  currentBsMonth,
  shiftBsMonth,
} from "@/lib/formatters/nepali-date";
import { useLanguageStore } from "@/stores/language-store";
import { AgendaList } from "../components/agenda-list";
import { DayPanel } from "../components/day-panel";
import { EventDialog } from "../components/event-dialog";
import { MonthGrid } from "../components/month-grid";
import { MonthHeader } from "../components/month-header";
import { calendarFeedQueryOptions } from "../queries";
import type { CalendarEntry } from "../types";

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
  const [bsAnchor, setBsAnchor] = useState(currentBsMonth);
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

  const showGrid = layout === "grid" && mode === "bs";

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
            <Can permission={{ calendar: ["manage"] }}>
              <Button onClick={() => setAdding(true)}>
                {t("ui.web.calendar.add")}
              </Button>
            </Can>
          </div>
        }
      />

      {!showGrid && (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => shift(-1)}>
            {t("ui.web.calendar.previous")}
          </Button>
          <span className="min-w-40 text-center font-medium text-sm">
            {label}
          </span>
          <Button variant="outline" size="sm" onClick={() => shift(1)}>
            {t("ui.web.calendar.next")}
          </Button>
        </div>
      )}

      {showGrid ? (
        <div className="flex flex-col gap-4">
          <MonthHeader
            year={bsAnchor.year}
            month={bsAnchor.month}
            from={window.from}
            to={window.to}
            language={language}
            onShift={shift}
            onToday={() => {
              setBsAnchor(currentBsMonth());
              setSelectedDay(null);
            }}
          />

          <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
            <MonthGrid
              weeks={weeks}
              entriesByDay={entriesByDay}
              language={language}
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
            />

            <DayPanel
              selectedDay={selectedDay}
              entries={selectedEntries}
              language={language}
            />
          </div>
        </div>
      ) : !isFetching && grouped.length === 0 ? (
        <EmptyState
          title={t("ui.web.calendar.empty")}
          description={t("ui.web.calendar.emptyHint")}
        />
      ) : (
        <AgendaList days={grouped} language={language} />
      )}

      <EventDialog
        businessId={business.id}
        open={adding}
        onOpenChange={setAdding}
      />
    </div>
  );
}
