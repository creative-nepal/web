"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { apiErrorMessage } from "@/lib/api-error";
import { productQueryKeys } from "../queries";
import { updateProductPacking } from "../services";
import type { Product } from "../types";

export function PackingDialog({
  businessId,
  product,
  onOpenChange,
}: {
  businessId: string;
  product: Product | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();

  const queryClient = useQueryClient();
  const [unitsPerPack, setUnitsPerPack] = useState(1);
  const [subUnitLabel, setSubUnitLabel] = useState("");

  const save = useMutation({
    mutationFn: () =>
      updateProductPacking(businessId, product?.id ?? "", {
        unitsPerPack,
        ...(subUnitLabel ? { subUnitLabel } : {}),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productQueryKeys.all });
      onOpenChange(false);
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  return (
    <Dialog
      open={product !== null}
      onOpenChange={(open) => {
        if (open && product) {
          setUnitsPerPack(product.unitsPerPack);
          setSubUnitLabel(product.subUnitLabel ?? "");
        }
        onOpenChange(open);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{product?.name}</DialogTitle>
          <DialogDescription>
            {t("ui.web.products.unitsPerPackHint")}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="unitsPerPack">
              {t("ui.web.products.unitsPerPack")}
            </Label>
            <Input
              id="unitsPerPack"
              type="number"
              min={1}
              value={unitsPerPack}
              onChange={(event) =>
                setUnitsPerPack(Math.max(1, Number(event.target.value)))
              }
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="subUnitLabel">
              {t("ui.web.products.subUnitLabel")}
            </Label>
            <Input
              id="subUnitLabel"
              value={subUnitLabel}
              onChange={(event) => setSubUnitLabel(event.target.value)}
              placeholder="tab"
            />
            <p className="text-muted-foreground text-xs">
              {t("ui.web.products.subUnitLabelHint")}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button disabled={save.isPending} onClick={() => save.mutate()}>
            {t("ui.action.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
