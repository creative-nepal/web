"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import type { Product } from "@/features/products/types";
import { money } from "@/lib/money";

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  onSelect: (product: Product) => void;
  onFindSubstitutes?: (product: Product) => void;
}

export function ProductGrid({
  products,
  isLoading,
  onSelect,
  onFindSubstitutes,
}: ProductGridProps) {
  const { t } = useTranslation();

  if (!isLoading && products.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        {t("ui.web.pos.noProducts")}
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => {
        const schedule = product.sectorData?.schedule;

        return (
          <div key={product.id} className="flex flex-col rounded-lg border">
            <button
              type="button"
              onClick={() => onSelect(product)}
              disabled={product.stockQty <= 0}
              className="p-3 text-left transition hover:bg-accent disabled:opacity-50"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium text-sm">{product.name}</span>
                {schedule && schedule !== "otc" && (
                  <Badge variant="destructive">{schedule}</Badge>
                )}
              </div>
              <div className="mt-1 flex items-center justify-between text-xs">
                <span className="tabular-nums">
                  {money(product.priceCents)}
                </span>
                <span
                  className={
                    product.isLowStock
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }
                >
                  {product.stockQty} {product.unitType}
                </span>
              </div>
            </button>
            {onFindSubstitutes && (
              <Button
                variant="ghost"
                size="sm"
                className="justify-start rounded-t-none border-t text-xs"
                onClick={() => onFindSubstitutes(product)}
              >
                {t("ui.web.pos.substitutes")}
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
