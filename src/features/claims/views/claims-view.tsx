"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/composed/empty-state";
import { PageHeader } from "@/components/composed/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { money } from "@/lib/money";
import { claimQueryKeys, claimsQueryOptions } from "../queries";
import { transitionClaim } from "../services";
import type { ClaimStatus } from "../types";

const VARIANT: Record<
  ClaimStatus,
  "default" | "outline" | "secondary" | "destructive"
> = {
  draft: "secondary",
  submitted: "outline",
  approved: "default",
  rejected: "destructive",
};

export function ClaimsView() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const business = useCurrentBusiness();
  const [settle, setSettle] = useState<Record<string, string>>({});

  const { data, isFetching } = useQuery(claimsQueryOptions(business?.id ?? ""));

  const move = useMutation({
    mutationFn: (input: {
      claimId: string;
      status: ClaimStatus;
      settledAmountCents?: number;
      reason?: string;
    }) =>
      transitionClaim(business?.id ?? "", input.claimId, {
        status: input.status,
        settledAmountCents: input.settledAmountCents,
        reason: input.reason,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: claimQueryKeys.all });
      toast.success(t("ui.web.medical.claimUpdated"));
    },
    onError: (error) => {
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? t("ui.error.generic"),
      );
    },
  });

  if (!business) {
    return null;
  }

  const rows = data?.data ?? [];

  if (!isFetching && rows.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title={t("ui.web.medical.claimsTitle")} />
        <EmptyState title={t("ui.web.medical.claimsEmpty")} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("ui.web.medical.claimsTitle")} />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("ui.field.name")}</TableHead>
            <TableHead className="text-right">{t("ui.field.amount")}</TableHead>
            <TableHead>{t("ui.field.status")}</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((claim) => (
            <TableRow key={claim.id}>
              <TableCell className="font-medium">
                {claim.provider}
                <span className="block text-muted-foreground text-xs">
                  {claim.policyNumber}
                </span>
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {money(claim.claimedAmountCents)}
                {claim.settledAmountCents !== null && (
                  <span className="block text-muted-foreground text-xs">
                    {money(claim.settledAmountCents)}
                  </span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={VARIANT[claim.status]}>
                  {t(`common.claimStatus.${claim.status}`)}
                </Badge>
              </TableCell>
              <TableCell>
                <Can permission={{ invoice: ["credit-note"] }}>
                  <div className="flex justify-end gap-1">
                    {claim.status === "draft" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={move.isPending}
                        onClick={() =>
                          move.mutate({
                            claimId: claim.id,
                            status: "submitted",
                          })
                        }
                      >
                        {t("ui.web.medical.submit")}
                      </Button>
                    )}
                    {claim.status === "submitted" && (
                      <>
                        <Input
                          type="number"
                          className="w-28"
                          placeholder={t("ui.web.medical.settledAmount")}
                          value={settle[claim.id] ?? ""}
                          onChange={(event) =>
                            setSettle((current) => ({
                              ...current,
                              [claim.id]: event.target.value,
                            }))
                          }
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={move.isPending || !settle[claim.id]}
                          onClick={() =>
                            move.mutate({
                              claimId: claim.id,
                              status: "approved",
                              settledAmountCents: Math.round(
                                Number(settle[claim.id]) * 100,
                              ),
                            })
                          }
                        >
                          {t("ui.web.medical.approve")}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={move.isPending}
                          onClick={() =>
                            move.mutate({
                              claimId: claim.id,
                              status: "rejected",
                              reason: t("ui.web.medical.reject"),
                            })
                          }
                        >
                          {t("ui.web.medical.reject")}
                        </Button>
                      </>
                    )}
                  </div>
                </Can>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
