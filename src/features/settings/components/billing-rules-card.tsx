"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Label } from "@/components/ui/label";
import { businessQueryKeys } from "@/features/business/queries";
import type { Business } from "@/features/business/types";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { api } from "@/lib/api";

function clampPercent(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 0), 100) : 0;
}

export function BillingRulesCard({ business }: { business: Business }) {
  const { t } = useTranslation();

  const queryClient = useQueryClient();
  const [serviceChargePercent, setServiceChargePercent] = useState(
    business.serviceChargePercent,
  );
  const [maxDiscountPercent, setMaxDiscountPercent] = useState(
    business.maxDiscountPercent,
  );

  const dirty =
    serviceChargePercent !== business.serviceChargePercent ||
    maxDiscountPercent !== business.maxDiscountPercent;

  const save = useMutation({
    mutationFn: async () => {
      await api.patch(`/api/v1/businesses/${business.id}`, {
        serviceChargePercent,
        maxDiscountPercent,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: businessQueryKeys.all });
      toast.success(t("ui.web.settings.billingRulesUpdated"));
    },
    onError: () => toast.error(t("ui.web.settings.ownerOnly")),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("ui.web.settings.billingRules")}</CardTitle>
        <CardDescription>
          {t("ui.web.settings.billingRulesHint")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="serviceChargePercent">
            {t("ui.web.settings.serviceChargePercent")}
          </Label>
          <Input
            id="serviceChargePercent"
            type="number"
            min={0}
            max={100}
            value={serviceChargePercent}
            onChange={(event) =>
              setServiceChargePercent(clampPercent(event.target.value))
            }
          />
          <p className="text-muted-foreground text-xs">
            {t("ui.web.settings.serviceChargePercentHint")}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="maxDiscountPercent">
            {t("ui.web.settings.maxDiscountPercent")}
          </Label>
          <Input
            id="maxDiscountPercent"
            type="number"
            min={0}
            max={100}
            value={maxDiscountPercent}
            onChange={(event) =>
              setMaxDiscountPercent(clampPercent(event.target.value))
            }
          />
          <p className="text-muted-foreground text-xs">
            {t("ui.web.settings.maxDiscountPercentHint")}
          </p>
        </div>
        <Button
          className="w-fit"
          disabled={!dirty || save.isPending}
          onClick={() => save.mutate()}
        >
          {t("ui.action.save")}
        </Button>
      </CardContent>
    </Card>
  );
}
