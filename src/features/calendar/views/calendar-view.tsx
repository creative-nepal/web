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
import { EventDialog } from "../components/event-dialog";
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

function startOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function addMonths(date: Date, months: number): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1),
  );
}

function groupByDay(entries: CalendarEntry[]): [string, CalendarEntry[]][] {
  const byDay = new Map<string, CalendarEntry[]>();

  for (const entry of entries) {
    const day = entry.startsAt.slice(0, 10);
    byDay.set(day, [...(byDay.get(day) ?? []), entry]);
  }

  return [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b));
}

export function CalendarView() {
  const { t } = useTranslation();

  const business = useCurrentBusiness();
  const [anchor, setAnchor] = useState(() => startOfMonth(new Date()));
  const [adding, setAdding] = useState(false);

  const from = anchor.toISOString();
  const to = addMonths(anchor, 1).toISOString();

  const { data: entries, isFetching } = useQuery(
    calendarFeedQueryOptions(business?.id ?? "", from, to),
  );

  const grouped = useMemo(() => groupByDay(entries ?? []), [entries]);

  if (!business) {
    return null;
  }

  const monthLabel = anchor.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("ui.web.calendar.title")}
        description={t("ui.web.calendar.description")}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAnchor(addMonths(anchor, -1))}
            >
              {t("ui.web.calendar.previous")}
            </Button>
            <span className="min-w-36 text-center font-medium text-sm">
              {monthLabel}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAnchor(addMonths(anchor, 1))}
            >
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

      {!isFetching && grouped.length === 0 ? (
        <EmptyState
          title={t("ui.web.calendar.empty")}
          description={t("ui.web.calendar.emptyHint")}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {grouped.map(([day, dayEntries]) => (
            <div key={day} className="flex gap-4">
              <div className="w-28 shrink-0 pt-1">
                <span className="font-medium text-sm">
                  {new Date(`${day}T00:00:00Z`).toLocaleDateString(undefined, {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    timeZone: "UTC",
                  })}
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
                        ? "—"
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
          ))}
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
