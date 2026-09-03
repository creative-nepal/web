"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { getProduct } from "@/features/products/services";
import type { Product } from "@/features/products/types";
import { money } from "@/lib/money";
import { listSubstitutes } from "../services";

export function SubstitutesDialog({
  businessId,
  product,
  onOpenChange,
  onPick,
}: {
  businessId: string;
  product: Product | null;
  onOpenChange: (open: boolean) => void;
  onPick: (product: Product) => void;
}) {
  const { t } = useTranslation();

  const { data, isFetching } = useQuery({
    queryKey: ["substitutes", businessId, product?.id],
    queryFn: () => listSubstitutes(businessId, product?.id ?? ""),
    enabled: Boolean(businessId && product),
  });

  const pick = async (productId: string) => {
    onPick(await getProduct(businessId, productId));
    onOpenChange(false);
  };

  return (
    <Dialog open={product !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("ui.web.pos.substitutesTitle", { product: product?.name ?? "" })}
          </DialogTitle>
          <DialogDescription>{data?.genericName ?? ""}</DialogDescription>
        </DialogHeader>

        {!isFetching && data?.genericName === null && (
          <p className="text-muted-foreground text-sm">
            {t("ui.web.pos.noGenericName")}
          </p>
        )}

        {!isFetching &&
          data?.genericName !== null &&
          (data?.substitutes.length ?? 0) === 0 && (
            <p className="text-muted-foreground text-sm">
              {t("ui.web.pos.noSubstitutes")}
            </p>
          )}

        <div className="flex flex-col gap-2">
          {(data?.substitutes ?? []).map((substitute) => (
            <div
              key={substitute.productId}
              className="flex items-center gap-3 rounded-lg border p-3"
            >
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="font-medium text-sm">{substitute.name}</span>
                <span className="text-muted-foreground text-xs">
                  {substitute.manufacturer ?? "—"}
                  {substitute.earliestExpiry
                    ? ` · ${t("ui.web.pos.expiresFrom")} ${substitute.earliestExpiry}`
                    : ""}
                </span>
              </div>
              {substitute.schedule && substitute.schedule !== "otc" && (
                <Badge variant="destructive">{substitute.schedule}</Badge>
              )}
              <div className="flex flex-col items-end gap-0.5">
                <span className="tabular-nums text-sm">
                  {money(substitute.priceCents)}
                </span>
                <span
                  className={
                    substitute.stockQty <= 0
                      ? "text-destructive text-xs"
                      : "text-muted-foreground text-xs"
                  }
                >
                  {substitute.stockQty} {t("ui.web.pos.inStock")}
                </span>
              </div>
              <Button
                size="sm"
                disabled={substitute.stockQty <= 0}
                onClick={() => pick(substitute.productId)}
              >
                {t("ui.web.pos.addToCart")}
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
