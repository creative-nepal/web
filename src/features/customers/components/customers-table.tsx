"use client";

import { Amount } from "@/components/composed/amount";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import type { Customer } from "../types";

export function CustomersTable({
  customers,
  showPoints,
  onOpenReferral,
  onOpenLedger,
}: {
  customers: Customer[];
  showPoints: boolean;
  onOpenReferral: (customer: Customer) => void;
  onOpenLedger: (customer: Customer) => void;
}) {
  const { t } = useTranslation();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("ui.field.name")}</TableHead>
          <TableHead>{t("ui.field.phone")}</TableHead>
          <TableHead>{t("ui.field.email")}</TableHead>
          <TableHead className="text-right">
            {t("ui.web.loyalty.points")}
          </TableHead>
          <TableHead className="text-right">
            {t("ui.web.customers.creditLimit")}
          </TableHead>
          <TableHead className="text-right">
            {t("ui.web.customers.balance")}
          </TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => (
          <TableRow key={customer.id}>
            <TableCell className="font-medium">{customer.name}</TableCell>
            <TableCell>{customer.phone ?? "—"}</TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {customer.email ?? "—"}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {showPoints ? customer.loyaltyPoints : "—"}
            </TableCell>
            <TableCell className="text-right">
              <Amount cents={customer.creditLimitCents} tone="muted" />
            </TableCell>
            <TableCell className="text-right">
              {customer.balanceCents > 0 ? (
                <Badge variant="destructive">
                  <Amount cents={customer.balanceCents} />
                </Badge>
              ) : (
                <Badge variant="outline">{t("ui.web.customers.settled")}</Badge>
              )}
            </TableCell>
            <TableCell className="text-right">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onOpenReferral(customer)}
              >
                {t("ui.web.customers.referralTitle")}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onOpenLedger(customer)}
              >
                {t("ui.web.customers.ledger")}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
