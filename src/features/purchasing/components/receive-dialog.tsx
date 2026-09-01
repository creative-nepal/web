"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ContentDialog } from "@/components/composed/content-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { purchaseOrderQueryOptions, purchasingQueryKeys } from "../queries";
import { receivePurchaseOrder } from "../services";

export function ReceiveDialog({
  businessId,
  purchaseOrderId,
  onClose,
}: {
  businessId: string;
  purchaseOrderId: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  const queryClient = useQueryClient();
  const { data } = useQuery(
    purchaseOrderQueryOptions(businessId, purchaseOrderId),
  );
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!data) return;

    setQuantities(
      Object.fromEntries(
        data.items.map((item) => [
          item.id,
          Math.max(Number(item.orderedQty) - Number(item.receivedQty), 0),
        ]),
      ),
    );
  }, [data]);

  const receive = useMutation({
    mutationFn: () =>
      receivePurchaseOrder(
        businessId,
        purchaseOrderId,
        Object.entries(quantities)
          .filter(([, qty]) => qty > 0)
          .map(([purchaseOrderItemId, receivedQty]) => ({
            purchaseOrderItemId,
            receivedQty,
          })),
      ),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: purchasingQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(
        result.order.status === "received"
          ? "Order fully received"
          : "Partial receipt recorded",
      );
      onClose();
    },
    onError: (error) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Could not record receipt";
      toast.error(message);
    },
  });

  return (
    <ContentDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={t("ui.web.purchasing.receiveTitle")}
      description={t("ui.web.purchasing.receiveHint")}
    >
      <div className="flex flex-col gap-3">
        {(data?.items ?? []).map((item) => {
          const outstanding =
            Number(item.orderedQty) - Number(item.receivedQty);

          return (
            <div key={item.id} className="flex items-center gap-3">
              <div className="flex flex-1 flex-col">
                <Label className="text-sm">
                  {item.batchNo
                    ? `Batch ${item.batchNo}`
                    : item.productId.slice(0, 8)}
                </Label>
                <span className="text-muted-foreground text-xs">
                  {item.receivedQty} of {item.orderedQty} received
                  {item.expiryDate && ` · expires ${item.expiryDate}`}
                </span>
              </div>
              <Input
                type="number"
                min={0}
                max={outstanding}
                value={quantities[item.id] ?? 0}
                onChange={(event) =>
                  setQuantities((current) => ({
                    ...current,
                    [item.id]: Number(event.target.value),
                  }))
                }
                className="w-24"
              />
            </div>
          );
        })}

        <Button
          onClick={() => receive.mutate()}
          disabled={
            receive.isPending ||
            Object.values(quantities).every((qty) => qty <= 0)
          }
        >
          {receive.isPending ? "Recording..." : "Record receipt"}
        </Button>
      </div>
    </ContentDialog>
  );
}
