"use client";

import { Amount } from "@/components/composed/amount";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface BreakdownRow {
  key: string;
  label: string;
  count: number;
  amountCents: number;
}

export function BreakdownCard({
  title,
  countHeader,
  amountHeader,
  labelHeader,
  emptyLabel,
  rows,
}: {
  title: string;
  labelHeader: string;
  countHeader: string;
  amountHeader: string;
  emptyLabel: string;
  rows: BreakdownRow[];
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 py-1">
        <span className="font-medium text-sm">{title}</span>
        {rows.length === 0 ? (
          <p className="text-muted-foreground text-sm">{emptyLabel}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{labelHeader}</TableHead>
                <TableHead className="text-right">{countHeader}</TableHead>
                <TableHead className="text-right">{amountHeader}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.key}>
                  <TableCell>{row.label}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {row.count}
                  </TableCell>
                  <TableCell className="text-right">
                    <Amount cents={row.amountCents} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
