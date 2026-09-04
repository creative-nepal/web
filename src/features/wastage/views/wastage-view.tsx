"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/composed/empty-state";
import { PageHeader } from "@/components/composed/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCurrentBusiness } from "@/features/business/business-provider";
import { Can } from "@/features/business/components/can";
import { ExportMenu } from "@/features/data-transfer/components/export-menu";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { productsQueryOptions } from "@/features/products/queries";
import { menuQueryOptions } from "@/features/restaurant/queries";
import { apiErrorMessage } from "@/lib/api-error";
import { money } from "@/lib/money";
import {
  wastageQueryKeys,
  wastageQueryOptions,
  wastageReportQueryOptions,
} from "../queries";
import { recordWastage } from "../services";
import { WASTAGE_REASONS } from "../types";

export function WastageView() {
  const { t } = useTranslation();

  const business = useCurrentBusiness();
  const queryClient = useQueryClient();
  const isRestaurant = business?.sector === "restaurant";

  const [targetId, setTargetId] = useState<string>("");
  const [useDish, setUseDish] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState<string>("spoilage");
  const [note, setNote] = useState("");

  const { data: records } = useQuery(wastageQueryOptions(business?.id ?? ""));
  const { data: report } = useQuery(
    wastageReportQueryOptions(business?.id ?? ""),
  );
  const { data: products } = useQuery(
    productsQueryOptions(business?.id ?? "", ""),
  );
  const { data: menu } = useQuery(
    menuQueryOptions(isRestaurant ? (business?.id ?? "") : ""),
  );

  const record = useMutation({
    mutationFn: () =>
      recordWastage(business?.id ?? "", {
        ...(useDish ? { menuItemId: targetId } : { productId: targetId }),
        quantity: Number(quantity),
        reason,
        ...(note ? { note } : {}),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: wastageQueryKeys.all });
      setTargetId("");
      setQuantity("");
      setNote("");
      toast.success(t("ui.web.wastage.recorded"));
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  if (!business) {
    return null;
  }

  const options = useDish
    ? (menu ?? []).map((item) => ({ id: item.id, name: item.name }))
    : (products?.data ?? []).map((item) => ({
        id: item.id,
        name: item.name,
      }));

  const rows = records?.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("ui.web.wastage.title")}
        description={t("ui.web.wastage.description")}
        actions={<ExportMenu businessId={business.id} resource="wastage" />}
      />

      <Can permission={{ wastage: ["record"] }}>
        <Card>
          <CardHeader>
            <CardTitle>{t("ui.web.wastage.recordTitle")}</CardTitle>
            {isRestaurant && (
              <CardDescription>
                {t("ui.web.wastage.recipeNote")}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="flex flex-wrap items-end gap-2">
            {isRestaurant && (
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant={useDish ? "outline" : "default"}
                  onClick={() => {
                    setUseDish(false);
                    setTargetId("");
                  }}
                >
                  {t("ui.web.wastage.stockItem")}
                </Button>
                <Button
                  size="sm"
                  variant={useDish ? "default" : "outline"}
                  onClick={() => {
                    setUseDish(true);
                    setTargetId("");
                  }}
                >
                  {t("ui.web.wastage.menuItem")}
                </Button>
              </div>
            )}
            <Select
              value={targetId}
              onValueChange={(value) => setTargetId(value ?? "")}
            >
              <SelectTrigger className="w-56">
                <SelectValue placeholder={t("ui.web.wastage.target")} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              min={0}
              step="0.001"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              placeholder={t("ui.web.wastage.quantity")}
              className="max-w-28"
            />
            <Select
              value={reason}
              onValueChange={(value) => setReason(value ?? "spoilage")}
            >
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WASTAGE_REASONS.map((entry) => (
                  <SelectItem key={entry} value={entry}>
                    {t(`common.wastageReason.${entry}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={t("ui.web.wastage.note")}
              className="max-w-52"
            />
            <Button
              disabled={!targetId || quantity === "" || record.isPending}
              onClick={() => record.mutate()}
            >
              {t("ui.web.wastage.record")}
            </Button>
          </CardContent>
        </Card>
      </Can>

      {(report?.entries ?? 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {t("ui.web.wastage.totalCost")} · {t("ui.web.wastage.last30")}
            </CardTitle>
            <CardDescription className="font-medium text-destructive text-lg tabular-nums">
              {money(report?.totalCostCents ?? 0)}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-xs">
                {t("ui.web.wastage.byReason")}
              </span>
              {(report?.byReason ?? []).map((row) => (
                <span key={row.reason} className="text-sm tabular-nums">
                  {t(`common.wastageReason.${row.reason}`)} ·{" "}
                  {money(row.costCents)}
                </span>
              ))}
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-xs">
                {t("ui.web.wastage.worstItems")}
              </span>
              {(report?.topItems ?? []).slice(0, 5).map((row) => (
                <span key={row.itemName} className="text-sm tabular-nums">
                  {row.itemName} · {money(row.costCents)}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {rows.length === 0 ? (
        <EmptyState
          title={t("ui.web.wastage.empty")}
          description={t("ui.web.wastage.emptyHint")}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("ui.field.when")}</TableHead>
              <TableHead>{t("ui.web.wastage.item")}</TableHead>
              <TableHead className="text-right">
                {t("ui.web.wastage.quantity")}
              </TableHead>
              <TableHead>{t("ui.web.wastage.reason")}</TableHead>
              <TableHead className="text-right">
                {t("ui.web.wastage.cost")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="text-sm">
                  {new Date(row.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="font-medium">
                  {row.itemName}
                  {row.note && (
                    <span className="block text-muted-foreground text-xs">
                      {row.note}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.quantity}
                </TableCell>
                <TableCell>{t(`common.wastageReason.${row.reason}`)}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {money(row.costCents)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
