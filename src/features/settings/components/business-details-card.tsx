"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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

export function BusinessDetailsCard({ business }: { business: Business }) {
  const { t } = useTranslation();

  const queryClient = useQueryClient();
  const [legalName, setLegalName] = useState("");
  const [panNumber, setPanNumber] = useState("");

  const save = useMutation({
    mutationFn: async () => {
      await api.patch(`/api/v1/businesses/${business.id}`, {
        ...(legalName && { legalName }),
        ...(panNumber && { panNumber }),
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: businessQueryKeys.all });
      toast.success(t("ui.web.settings.businessUpdated"));
    },
    onError: () => toast.error(t("ui.web.settings.ownerOnly")),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("ui.web.settings.businessDetails")}</CardTitle>
        <CardDescription>
          {t("ui.web.settings.businessDetailsHint")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="legalName">{t("ui.web.settings.legalName")}</Label>
          <Input
            id="legalName"
            value={legalName}
            onChange={(event) => setLegalName(event.target.value)}
            placeholder={business.legalName}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="pan">PAN</Label>
          <Input
            id="pan"
            value={panNumber}
            onChange={(event) => setPanNumber(event.target.value)}
            placeholder={business.panNumber ?? "Not set"}
          />
        </div>
        <div className="flex gap-2">
          {business.vatRegistered && (
            <Badge variant="outline">
              {t("ui.web.settings.vatRegistered")}
            </Badge>
          )}
          {business.cbmsRequired && (
            <Badge variant="outline">{t("ui.web.settings.cbmsRequired")}</Badge>
          )}
        </div>
        <Button
          className="w-fit"
          disabled={(!legalName && !panNumber) || save.isPending}
          onClick={() => save.mutate()}
        >
          {t("ui.action.save")}
        </Button>
      </CardContent>
    </Card>
  );
}
