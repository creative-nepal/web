"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { EmptyState } from "@/components/composed/empty-state";
import { PageHeader } from "@/components/composed/page-header";
import { SearchInput } from "@/components/composed/search-input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCurrentBusiness } from "@/features/business/business-provider";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { formatCurrency } from "@/lib/formatters";
import { productsQueryOptions } from "../queries";

export function ProductsView() {
  const { t } = useTranslation();

  const business = useCurrentBusiness();
  const [search, setSearch] = useState("");
  const { data, isFetching } = useQuery(
    productsQueryOptions(business?.id ?? "", search),
  );

  if (!business) {
    return null;
  }

  const isMedical = business.sector === "medical";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("ui.web.products.title")}
        description={
          isMedical
            ? "Stock is tracked per batch; the figure here is the live, unexpired total."
            : "Everything this business sells."
        }
      />

      <SearchInput
        value={search}
        onValueChange={setSearch}
        placeholder={t("ui.web.products.searchPlaceholder")}
        className="max-w-sm"
      />

      {!isFetching && (data?.data ?? []).length === 0 ? (
        <EmptyState
          title={t("ui.web.products.emptyTitle")}
          description={t("ui.web.products.emptyBody")}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("ui.field.name")}</TableHead>
              <TableHead>SKU</TableHead>
              {isMedical && <TableHead>{t("ui.field.schedule")}</TableHead>}
              <TableHead className="text-right">
                {t("ui.field.price")}
              </TableHead>
              <TableHead className="text-right">
                {t("ui.field.stock")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data?.data ?? []).map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {product.sku ?? "—"}
                </TableCell>
                {isMedical && (
                  <TableCell>
                    {product.sectorData?.schedule &&
                    product.sectorData.schedule !== "otc" ? (
                      <Badge variant="destructive">
                        {product.sectorData.schedule}
                      </Badge>
                    ) : (
                      <Badge variant="outline">otc</Badge>
                    )}
                  </TableCell>
                )}
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(product.priceCents / 100, "NPR")}
                </TableCell>
                <TableCell
                  className={`text-right tabular-nums ${
                    product.isLowStock ? "text-destructive" : ""
                  }`}
                >
                  {product.stockQty} {product.unitType}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
