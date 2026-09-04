"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { Business } from "@/features/business/types";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { apiErrorMessage } from "@/lib/api-error";
import { getSettings, updateSettings } from "../services";
import { RECEIPT_WIDTHS } from "../types";

export function PreferencesCard({ business }: { business: Business }) {
  const { t } = useTranslation();

  const queryClient = useQueryClient();
  const queryKey = ["business-settings", business.id];
  const { data: settings } = useQuery({
    queryKey,
    queryFn: () => getSettings(business.id),
  });

  const [draft, setDraft] = useState<Record<string, unknown>>({});

  const value = <K extends string>(key: K, fallback: unknown) =>
    key in draft
      ? draft[key]
      : ((settings as Record<string, unknown> | undefined)?.[key] ?? fallback);

  const set = (key: string, next: unknown) =>
    setDraft((current) => ({ ...current, [key]: next }));

  const save = useMutation({
    mutationFn: () => updateSettings(business.id, draft),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
      setDraft({});
      toast.success(t("ui.web.settings.settingsSaved"));
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  if (!settings) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("ui.web.settings.orgSettings")}</CardTitle>
        <CardDescription>
          {t("ui.web.settings.orgSettingsHint")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="contactPhone">
              {t("ui.web.settings.contactPhone")}
            </Label>
            <Input
              id="contactPhone"
              value={String(value("contactPhone", "") ?? "")}
              onChange={(event) => set("contactPhone", event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="contactEmail">
              {t("ui.web.settings.contactEmail")}
            </Label>
            <Input
              id="contactEmail"
              type="email"
              value={String(value("contactEmail", "") ?? "")}
              onChange={(event) => set("contactEmail", event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="addressLine">
              {t("ui.web.settings.addressLine")}
            </Label>
            <Input
              id="addressLine"
              value={String(value("addressLine", "") ?? "")}
              onChange={(event) => set("addressLine", event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="website">{t("ui.web.settings.website")}</Label>
            <Input
              id="website"
              value={String(value("website", "") ?? "")}
              onChange={(event) => set("website", event.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="invoiceFooter">
            {t("ui.web.settings.invoiceFooter")}
          </Label>
          <Textarea
            id="invoiceFooter"
            rows={2}
            value={String(value("invoiceFooter", "") ?? "")}
            onChange={(event) => set("invoiceFooter", event.target.value)}
          />
          <p className="text-muted-foreground text-xs">
            {t("ui.web.settings.invoiceFooterHint")}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="receiptWidth">
              {t("ui.web.settings.receiptWidth")}
            </Label>
            <Select
              value={String(value("receiptWidth", "80mm"))}
              onValueChange={(next) => set("receiptWidth", next ?? "80mm")}
            >
              <SelectTrigger id="receiptWidth">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RECEIPT_WIDTHS.map((width) => (
                  <SelectItem key={width} value={width}>
                    {width}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="timezone">{t("ui.web.settings.timezone")}</Label>
            <Input
              id="timezone"
              value={String(value("timezone", "Asia/Kathmandu"))}
              onChange={(event) => set("timezone", event.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <span className="font-medium text-sm">
            {t("ui.web.settings.alerts")}
          </span>
          {(
            [
              ["digestEnabled", t("ui.web.settings.digestEnabled")],
              ["lowStockAlertsEnabled", t("ui.web.settings.lowStockAlerts")],
              ["expiryAlertsEnabled", t("ui.web.settings.expiryAlerts")],
              ["showLogoOnReceipt", t("ui.web.settings.showLogo")],
            ] as const
          ).map(([key, label]) => (
            <Label key={key} className="flex items-center gap-2 font-normal">
              <Switch
                checked={Boolean(value(key, true))}
                onCheckedChange={(checked) => set(key, checked)}
              />
              {label}
            </Label>
          ))}
        </div>

        <Button
          className="w-fit"
          disabled={Object.keys(draft).length === 0 || save.isPending}
          onClick={() => save.mutate()}
        >
          {t("ui.action.save")}
        </Button>
      </CardContent>
    </Card>
  );
}
