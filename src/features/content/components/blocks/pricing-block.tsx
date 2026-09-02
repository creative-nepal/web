import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTranslations } from "@/features/i18n/server";
import { formatCurrency } from "@/lib/formatters";
import { fetchPublicPlans } from "../../services";
import type { PricingBlock } from "../../types";

function limitLabel(value: unknown): string | null {
  return typeof value === "number" ? String(value) : null;
}

export async function PricingBlockView({ block }: { block: PricingBlock }) {
  const { t } = await getTranslations();
  const plans = await fetchPublicPlans(block.sector);

  if (plans.length === 0) {
    return null;
  }

  return (
    <section className="border-b">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-14">
        {(block.heading || block.subheading) && (
          <div className="flex flex-col gap-2">
            {block.heading && (
              <h2 className="font-heading text-xl font-semibold tracking-tight">
                {block.heading}
              </h2>
            )}
            {block.subheading && (
              <p className="max-w-2xl text-sm/relaxed text-muted-foreground">
                {block.subheading}
              </p>
            )}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const maxStaff = limitLabel(plan.featureFlags.maxStaff);
            const maxProducts = limitLabel(plan.featureFlags.maxProducts);

            return (
              <Card key={plan.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle>{plan.name}</CardTitle>
                    <Badge variant="secondary">
                      {t(`common.sector.${plan.sector}`)}
                    </Badge>
                  </div>
                  <CardDescription>
                    <span className="font-medium text-foreground text-lg tabular-nums">
                      {formatCurrency(plan.priceCents)}
                    </span>{" "}
                    {t(`ui.admin.plans.${plan.billingCycle}`)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between gap-4">
                  <ul className="flex flex-col gap-1 text-muted-foreground text-sm">
                    {maxStaff && (
                      <li>
                        {t("ui.web.pricing.staffLimit", { count: maxStaff })}
                      </li>
                    )}
                    {maxProducts && (
                      <li>
                        {t("ui.web.pricing.productLimit", {
                          count: maxProducts,
                        })}
                      </li>
                    )}
                  </ul>
                  {block.ctaLabel && block.ctaHref && (
                    <Button
                      render={<Link href={block.ctaHref} />}
                      nativeButton={false}
                      className="w-full"
                    >
                      {block.ctaLabel}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
