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
  const [loyaltyPointsPerHundred, setLoyaltyPointsPerHundred] = useState(
    business.loyaltyPointsPerHundred,
  );
  const [loyaltyPointValueCents, setLoyaltyPointValueCents] = useState(
    business.loyaltyPointValueCents,
  );
  const [referralRewardPoints, setReferralRewardPoints] = useState(
    business.referralRewardPoints,
  );
  const [referralWelcomePoints, setReferralWelcomePoints] = useState(
    business.referralWelcomePoints,
  );

  const dirty =
    serviceChargePercent !== business.serviceChargePercent ||
    maxDiscountPercent !== business.maxDiscountPercent ||
    loyaltyPointsPerHundred !== business.loyaltyPointsPerHundred ||
    loyaltyPointValueCents !== business.loyaltyPointValueCents ||
    referralRewardPoints !== business.referralRewardPoints ||
    referralWelcomePoints !== business.referralWelcomePoints;

  const save = useMutation({
    mutationFn: async () => {
      await api.patch(`/api/v1/businesses/${business.id}`, {
        serviceChargePercent,
        maxDiscountPercent,
        loyaltyPointsPerHundred,
        loyaltyPointValueCents,
        referralRewardPoints,
        referralWelcomePoints,
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
        <div className="flex flex-col gap-1">
          <Label htmlFor="loyaltyPointsPerHundred">
            {t("ui.web.loyalty.pointsPerHundred")}
          </Label>
          <Input
            id="loyaltyPointsPerHundred"
            type="number"
            min={0}
            max={100}
            value={loyaltyPointsPerHundred}
            onChange={(event) =>
              setLoyaltyPointsPerHundred(clampPercent(event.target.value))
            }
          />
          <p className="text-muted-foreground text-xs">
            {t("ui.web.loyalty.loyaltyHint")}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="loyaltyPointValueCents">
            {t("ui.web.loyalty.pointValue")}
          </Label>
          <Input
            id="loyaltyPointValueCents"
            type="number"
            min={0}
            value={loyaltyPointValueCents}
            onChange={(event) =>
              setLoyaltyPointValueCents(
                Math.max(0, Number(event.target.value) || 0),
              )
            }
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="referralRewardPoints">
            {t("ui.web.settings.referralRewardPoints")}
          </Label>
          <Input
            id="referralRewardPoints"
            type="number"
            min={0}
            value={referralRewardPoints}
            onChange={(event) =>
              setReferralRewardPoints(
                Math.max(0, Number(event.target.value) || 0),
              )
            }
          />
          <p className="text-muted-foreground text-xs">
            {t("ui.web.settings.referralHint")}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="referralWelcomePoints">
            {t("ui.web.settings.referralWelcomePoints")}
          </Label>
          <Input
            id="referralWelcomePoints"
            type="number"
            min={0}
            value={referralWelcomePoints}
            onChange={(event) =>
              setReferralWelcomePoints(
                Math.max(0, Number(event.target.value) || 0),
              )
            }
          />
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
