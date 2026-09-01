"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { entitlementsQueryOptions } from "@/features/business/queries";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { formatDate } from "@/lib/formatters";

export function PlanCard({ businessId }: { businessId: string }) {
  const { t } = useTranslation();

  const { data: entitlements } = useQuery(entitlementsQueryOptions(businessId));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("ui.field.plan")}</CardTitle>
        <CardDescription>
          What this business is subscribed to. Limits here are enforced by the
          API, not just displayed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {entitlements?.planName ? (
          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground text-sm">
                {t("ui.field.plan")}
              </dt>
              <dd className="font-medium">{entitlements.planName}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground text-sm">
                {t("ui.web.settings.renews")}
              </dt>
              <dd>
                {entitlements.currentPeriodEnd
                  ? formatDate(entitlements.currentPeriodEnd)
                  : "—"}
              </dd>
            </div>
            <div className="flex flex-col gap-1 sm:col-span-2">
              <dt className="text-muted-foreground text-sm">
                {t("ui.web.settings.includes")}
              </dt>
              <dd className="flex flex-wrap gap-1">
                {Object.entries(entitlements.featureFlags).map(
                  ([key, value]) => (
                    <Badge key={key} variant="secondary">
                      {key}: {String(value)}
                    </Badge>
                  ),
                )}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="text-muted-foreground text-sm">
            {t("ui.web.settings.noPlan")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
