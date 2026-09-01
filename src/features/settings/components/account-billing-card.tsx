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
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/formatters";
import { money } from "@/lib/money";

interface PlatformInvoice {
  id: string;
  invoiceNumber: number | null;
  series: string;
  totalCents: number;
  status: string;
  createdAt: string;
}

export function AccountBillingCard({
  businessCount,
}: {
  businessCount: number;
}) {
  const { t } = useTranslation();

  const { data: invoices } = useQuery({
    queryKey: ["platform-invoices"],
    queryFn: async () => {
      const { data } = await api.get<PlatformInvoice[]>(
        "/api/v1/billing/invoices",
      );
      return data;
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("ui.web.settings.accountBilling")}</CardTitle>
        <CardDescription>
          One wallet funds every business on this account — you own{" "}
          {businessCount}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {(invoices ?? []).length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {t("ui.web.settings.noPlatformInvoices")}
          </p>
        ) : (
          <ul className="flex flex-col divide-y">
            {(invoices ?? []).map((invoice) => (
              <li
                key={invoice.id}
                className="flex items-center justify-between py-2"
              >
                <span className="text-sm">
                  {invoice.invoiceNumber
                    ? `#${invoice.invoiceNumber} · ${invoice.series}`
                    : "Draft"}
                  <span className="block text-muted-foreground text-xs">
                    {formatDate(invoice.createdAt)}
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <Badge
                    variant={invoice.status === "paid" ? "default" : "outline"}
                  >
                    {invoice.status}
                  </Badge>
                  <span className="tabular-nums">
                    {money(invoice.totalCents)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
