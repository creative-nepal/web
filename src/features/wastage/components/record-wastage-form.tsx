"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
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
import { Can } from "@/features/business/components/can";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { productsQueryOptions } from "@/features/products/queries";
import { menuQueryOptions } from "@/features/restaurant/queries";
import { apiErrorMessage } from "@/lib/api-error";
import { wastageQueryKeys } from "../queries";
import { recordWastage } from "../services";
import { WASTAGE_REASONS } from "../types";

export function RecordWastageForm({
  businessId,
  isRestaurant,
}: {
  businessId: string;
  isRestaurant: boolean;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [targetId, setTargetId] = useState("");
  const [useDish, setUseDish] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("spoilage");
  const [note, setNote] = useState("");

  const { data: products } = useQuery(productsQueryOptions(businessId, ""));
  const { data: menu } = useQuery(
    menuQueryOptions(isRestaurant ? businessId : ""),
  );

  const record = useMutation({
    mutationFn: () =>
      recordWastage(businessId, {
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

  const options = useDish
    ? (menu ?? []).map((item) => ({ id: item.id, name: item.name }))
    : (products?.data ?? []).map((item) => ({ id: item.id, name: item.name }));

  return (
    <Can permission={{ wastage: ["record"] }}>
      <Card>
        <CardHeader>
          <CardTitle>{t("ui.web.wastage.recordTitle")}</CardTitle>
          {isRestaurant && (
            <CardDescription>{t("ui.web.wastage.recipeNote")}</CardDescription>
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
  );
}
