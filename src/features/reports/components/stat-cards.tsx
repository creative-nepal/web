"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface Stat {
  key: string;
  label: string;
  value: string;
}

export function StatCards({
  stats,
  className,
}: {
  stats: Stat[];
  className?: string;
}) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {stats.map((stat) => (
        <Card key={stat.key}>
          <CardContent className="flex flex-col gap-1 py-1">
            <span className="text-muted-foreground text-xs">{stat.label}</span>
            <span className="font-mono font-semibold text-xl tabular-nums">
              {stat.value}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
