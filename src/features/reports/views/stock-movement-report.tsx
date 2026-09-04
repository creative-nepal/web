"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/composed/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExportMenu } from "@/features/data-transfer/components/export-menu";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { productsQueryOptions } from "@/features/products/queries";
import { PeriodPicker, startOfDaysAgo } from "../components/period-picker";
import { stockMovementQueryOptions } from "../queries";

const SOURCE_VARIANT = {
  purchase: "default",
  sale: "secondary",
  wastage: "destructive",
  adjustment: "outline",
} as const;

export function StockMovementReport({ businessId }: { businessId: string }) {
  const { t } = useTranslation();

  const [days, setDays] = useState(30);
  const [productId, setProductId] = useState("");

  const range = useMemo(
    () => ({ from: startOfDaysAgo(days), to: new Date().toISOString() }),
    [days],
  );

  const { data: products } = useQuery(productsQueryOptions(businessId, ""));
  const { data } = useQuery(
    stockMovementQueryOptions(businessId, productId, range.from, range.to),
  );

  const options = products?.data ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <NativeSelect
            value={productId}
            onChange={(event) => setProductId(event.target.value)}
            className="w-64"
          >
            <NativeSelectOption value="">
              {t("ui.web.reports.chooseProduct")}
            </NativeSelectOption>
            {options.map((product) => (
              <NativeSelectOption key={product.id} value={product.id}>
                {product.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <PeriodPicker days={days} onChange={setDays} />
        </div>
        {productId && (
          <ExportMenu
            businessId={businessId}
            resource="reports/stock-movement"
            params={{ ...range, productId }}
          />
        )}
      </div>

      {!productId ? (
        <EmptyState
          title={t("ui.web.reports.chooseProduct")}
          description={t("ui.web.reports.stockMovementHint")}
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { key: "opening", value: data?.openingQty ?? 0 },
              { key: "stockIn", value: data?.inQty ?? 0 },
              { key: "stockOut", value: data?.outQty ?? 0 },
              { key: "closing", value: data?.closingQty ?? 0 },
            ].map((card) => (
              <Card key={card.key}>
                <CardContent className="flex flex-col gap-1 py-1">
                  <span className="text-muted-foreground text-xs">
                    {t(`ui.web.reports.${card.key}`)}
                  </span>
                  <span className="font-semibold text-xl tabular-nums">
                    {card.value} {data?.unitType ?? ""}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>

          {(data?.movements ?? []).length === 0 ? (
            <EmptyState title={t("ui.web.reports.noMovement")} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("ui.field.date")}</TableHead>
                  <TableHead>{t("ui.web.reports.source")}</TableHead>
                  <TableHead>{t("ui.web.reports.reference")}</TableHead>
                  <TableHead className="text-right">
                    {t("ui.web.reports.change")}
                  </TableHead>
                  <TableHead className="text-right">
                    {t("ui.web.reports.balance")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.movements ?? []).map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell className="tabular-nums">
                      {movement.at.replace("T", " ").slice(0, 16)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={SOURCE_VARIANT[movement.source]}>
                        {t(`ui.web.reports.movement.${movement.source}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {movement.note ?? movement.reference ?? "—"}
                    </TableCell>
                    <TableCell
                      className={`text-right tabular-nums ${
                        movement.quantity < 0
                          ? "text-destructive"
                          : "text-emerald-600"
                      }`}
                    >
                      {movement.quantity > 0 ? "+" : ""}
                      {movement.quantity}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {movement.runningQty}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </>
      )}
    </div>
  );
}
