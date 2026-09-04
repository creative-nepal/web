"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ContentDialog } from "@/components/composed/content-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { customerQueryKeys, referralQueryOptions } from "../queries";
import { claimReferral } from "../services";
import type { Customer } from "../types";

export function ReferralDialog({
  businessId,
  customer,
  onClose,
}: {
  businessId: string;
  customer: Customer;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [code, setCode] = useState("");

  const { data } = useQuery(referralQueryOptions(businessId, customer.id));

  const claim = useMutation({
    mutationFn: () => claimReferral(businessId, customer.id, code),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: customerQueryKeys.all });
      setCode("");
      toast.success(t("ui.web.customers.referralClaimed"));
    },
    onError: (error) =>
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? t("ui.error.generic"),
      ),
  });

  const copy = async () => {
    if (!data?.referralCode) {
      return;
    }

    await navigator.clipboard.writeText(data.referralCode);
    toast.success(t("ui.web.customers.referralCopied"));
  };

  const rewardsOff =
    data !== undefined && data.rewardPoints === 0 && data.welcomePoints === 0;

  return (
    <ContentDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={`${t("ui.web.customers.referralTitle")} — ${customer.name}`}
      description={t("ui.web.customers.referralShare")}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Label>{t("ui.web.customers.referralCode")}</Label>
          <div className="flex gap-2">
            <Input
              readOnly
              value={data?.referralCode ?? ""}
              className="font-mono tracking-widest"
            />
            <Button variant="outline" onClick={() => void copy()}>
              {t("ui.action.copy")}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            {t("ui.web.customers.referredCount")}: {data?.referredCount ?? 0}
          </Badge>
          <Badge variant="outline">
            {t("ui.web.customers.referralPointsEarned")}:{" "}
            {data?.pointsEarned ?? 0}
          </Badge>
          {data?.referredByName && (
            <Badge variant="secondary">
              {t("ui.web.customers.referredBy")}: {data.referredByName}
            </Badge>
          )}
        </div>

        {rewardsOff ? (
          <p className="text-muted-foreground text-sm">
            {t("ui.web.customers.referralOff")}
          </p>
        ) : (
          <div className="flex flex-col gap-1 text-muted-foreground text-xs">
            <span>
              {t("ui.web.customers.referralReward", {
                points: data?.rewardPoints ?? 0,
              })}
            </span>
            <span>
              {t("ui.web.customers.referralWelcome", {
                points: data?.welcomePoints ?? 0,
              })}
            </span>
          </div>
        )}

        {!data?.referredByCustomerId && (
          <div className="flex flex-col gap-1">
            <Label htmlFor="referralCode">
              {t("ui.web.customers.referralClaim")}
            </Label>
            <div className="flex gap-2">
              <Input
                id="referralCode"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="ABCD2345"
                className="font-mono tracking-widest uppercase"
              />
              <Button
                disabled={!code.trim() || claim.isPending}
                onClick={() => claim.mutate()}
              >
                {t("ui.action.save")}
              </Button>
            </div>
            <span className="text-muted-foreground text-xs">
              {t("ui.web.customers.referralClaimHint")}
            </span>
          </div>
        )}
      </div>
    </ContentDialog>
  );
}
