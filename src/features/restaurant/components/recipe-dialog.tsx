"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ContentDialog } from "@/components/composed/content-dialog";
import { EmptyState } from "@/components/composed/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { productsQueryOptions } from "@/features/products/queries";
import { recipeQueryOptions, restaurantQueryKeys } from "../queries";
import { setRecipe } from "../services";

interface DraftLine {
  productId: string;
  quantity: number;
}

export function RecipeDialog({
  businessId,
  menuItemId,
  menuItemName,
  onClose,
}: {
  businessId: string;
  menuItemId: string;
  menuItemName: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: recipe } = useQuery(recipeQueryOptions(businessId, menuItemId));
  const { data: products } = useQuery(productsQueryOptions(businessId, ""));

  const [lines, setLines] = useState<DraftLine[]>([]);

  useEffect(() => {
    if (recipe) {
      setLines(
        recipe.map((line) => ({
          productId: line.productId,
          quantity: Number(line.quantity),
        })),
      );
    }
  }, [recipe]);

  const save = useMutation({
    mutationFn: () =>
      setRecipe(
        businessId,
        menuItemId,
        lines.filter((line) => line.productId && line.quantity > 0),
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: restaurantQueryKeys.all });
      toast.success(t("ui.web.menu.recipeSaved"));
      onClose();
    },
    onError: (error) => {
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? t("ui.error.generic"),
      );
    },
  });

  const options = products?.data ?? [];

  return (
    <ContentDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={`${t("ui.web.menu.recipeTitle")} — ${menuItemName}`}
      description={t("ui.web.menu.recipeHint")}
    >
      <div className="flex flex-col gap-4">
        {lines.length === 0 ? (
          <EmptyState title={t("ui.web.menu.noRecipe")} />
        ) : (
          lines.map((line, index) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: draft rows have no stable id
              key={index}
              className="flex items-end gap-2"
            >
              <div className="flex flex-1 flex-col gap-1">
                <Label className="text-xs">{t("ui.field.product")}</Label>
                <NativeSelect
                  value={line.productId}
                  onChange={(event) =>
                    setLines((current) =>
                      current.map((entry, at) =>
                        at === index
                          ? { ...entry, productId: event.target.value }
                          : entry,
                      ),
                    )
                  }
                >
                  <NativeSelectOption value="">—</NativeSelectOption>
                  {options.map((product) => (
                    <NativeSelectOption key={product.id} value={product.id}>
                      {product.name} ({product.unitType})
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
              <div className="flex w-32 flex-col gap-1">
                <Label className="text-xs">{t("ui.web.menu.perServing")}</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.001"
                  value={line.quantity}
                  onChange={(event) =>
                    setLines((current) =>
                      current.map((entry, at) =>
                        at === index
                          ? { ...entry, quantity: Number(event.target.value) }
                          : entry,
                      ),
                    )
                  }
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setLines((current) => current.filter((_, at) => at !== index))
                }
              >
                {t("ui.action.cancel")}
              </Button>
            </div>
          ))
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setLines((current) => [...current, { productId: "", quantity: 1 }])
          }
        >
          {t("ui.web.menu.addIngredient")}
        </Button>

        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          {t("ui.web.menu.saveRecipe")}
        </Button>
      </div>
    </ContentDialog>
  );
}
