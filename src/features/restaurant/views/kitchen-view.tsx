"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EmptyState } from "@/components/composed/empty-state";
import { PageHeader } from "@/components/composed/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCurrentBusiness } from "@/features/business/business-provider";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { NEXT_KITCHEN_STATUS } from "../constants";
import { restaurantQueryKeys, ticketsQueryOptions } from "../queries";
import { advanceTicket } from "../services";

export function KitchenView() {
  const { t } = useTranslation();

  const business = useCurrentBusiness();
  const queryClient = useQueryClient();
  const { data: tickets } = useQuery(ticketsQueryOptions(business?.id ?? ""));

  const advance = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      advanceTicket(business?.id ?? "", id, status),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: restaurantQueryKeys.all }),
  });

  if (!business) {
    return null;
  }

  const open = tickets ?? [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("ui.web.restaurant.kitchenTitle")}
        description={t("ui.web.restaurant.kitchenDescription")}
      />

      {open.length === 0 ? (
        <EmptyState
          title={t("ui.web.restaurant.kitchenEmptyTitle")}
          description={t("ui.web.restaurant.kitchenEmptyBody")}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {open.map((ticket) => {
            const next = NEXT_KITCHEN_STATUS[ticket.status];

            return (
              <Card key={ticket.id}>
                <CardContent className="flex flex-col gap-3 py-1">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{ticket.station}</Badge>
                    <Badge
                      variant={
                        ticket.status === "ready" ? "default" : "outline"
                      }
                    >
                      {ticket.status.replace("_", " ")}
                    </Badge>
                  </div>

                  <ul className="flex flex-col gap-1 text-sm">
                    {ticket.items.map((item) => (
                      <li key={item.orderItemId}>
                        <span className="font-medium tabular-nums">
                          {item.quantity}×
                        </span>{" "}
                        {item.name}
                        {item.modifiers.length > 0 && (
                          <span className="block text-muted-foreground text-xs">
                            {item.modifiers
                              .map((modifier) => modifier.label)
                              .join(", ")}
                          </span>
                        )}
                        {item.note && (
                          <span className="block font-medium text-destructive text-xs">
                            {item.note}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>

                  {next && (
                    <Button
                      size="sm"
                      onClick={() =>
                        advance.mutate({ id: ticket.id, status: next.status })
                      }
                    >
                      {t(next.labelKey)}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
