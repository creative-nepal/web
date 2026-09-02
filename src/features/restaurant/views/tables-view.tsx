"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/composed/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCurrentBusiness } from "@/features/business/business-provider";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { tableStatusLabel } from "../constants";
import { restaurantQueryKeys, tablesQueryOptions } from "../queries";
import { billTable, closeTable, createTable } from "../services";

export function TablesView() {
  const { t } = useTranslation();

  const business = useCurrentBusiness();
  const queryClient = useQueryClient();
  const [tableNo, setTableNo] = useState("");

  const { data: tables } = useQuery(tablesQueryOptions(business?.id ?? ""));
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: restaurantQueryKeys.all });

  const add = useMutation({
    mutationFn: () => createTable(business?.id ?? "", { tableNo }),
    onSuccess: () => {
      setTableNo("");
      void invalidate();
    },
    onError: () => toast.error(t("ui.web.restaurant.tableExists")),
  });

  const bill = useMutation({
    mutationFn: (tableId: string) => billTable(business?.id ?? "", tableId),
    onSuccess: (invoices) => {
      void invalidate();
      toast.success(
        `${(invoices as unknown[]).length} invoice(s) issued for the sitting`,
      );
    },
    onError: (error) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? t("ui.web.restaurant.billFailed");
      toast.error(message);
    },
  });

  const close = useMutation({
    mutationFn: (tableId: string) => closeTable(business?.id ?? "", tableId),
    onSuccess: () => {
      void invalidate();
      toast.success(t("ui.web.restaurant.tableFreed"));
    },
  });

  if (!business) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("ui.web.restaurant.tablesTitle")}
        description={t("ui.web.restaurant.tablesDescription")}
        actions={
          <div className="flex gap-2">
            <Input
              value={tableNo}
              onChange={(event) => setTableNo(event.target.value)}
              placeholder={t("ui.web.restaurant.tableNumber")}
              className="w-32"
            />
            <Button disabled={!tableNo} onClick={() => add.mutate()}>
              {t("ui.action.add")}
            </Button>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(tables ?? []).map((table) => (
          <Card key={table.id}>
            <CardContent className="flex flex-col gap-3 py-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-lg">{table.tableNo}</span>
                <Badge
                  variant={
                    table.status === "occupied"
                      ? "default"
                      : table.status === "billed"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {tableStatusLabel(table.status, t)}
                </Badge>
              </div>
              <span className="text-muted-foreground text-xs">
                {table.seats} seats
              </span>

              {table.status === "occupied" && (
                <Button size="sm" onClick={() => bill.mutate(table.id)}>
                  {t("ui.web.restaurant.billTable")}
                </Button>
              )}
              {table.status === "billed" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => close.mutate(table.id)}
                >
                  {t("ui.web.restaurant.paymentReceived")}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
