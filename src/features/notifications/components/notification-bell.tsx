"use client";

import { RiNotification3Line } from "@remixicon/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentBusiness } from "@/features/business/business-provider";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import {
  notificationQueryKeys,
  notificationsQueryOptions,
  unreadCountQueryOptions,
} from "../queries";
import { markAllRead } from "../services";

export function NotificationBell() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const business = useCurrentBusiness();
  const businessId = business?.id ?? "";

  const { data: unread } = useQuery(unreadCountQueryOptions(businessId));
  const { data } = useQuery(notificationsQueryOptions(businessId));

  const readAll = useMutation({
    mutationFn: () => markAllRead(businessId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.all,
      });
    },
  });

  if (!business) {
    return null;
  }

  const items = data?.data ?? [];
  const count = unread?.unread ?? 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("ui.web.notifications.title")}
            className="relative"
          >
            <RiNotification3Line className="size-4" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground tabular-nums">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <span className="font-medium text-sm">
            {t("ui.web.notifications.title")}
          </span>
          {count > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => readAll.mutate()}
              disabled={readAll.isPending}
            >
              {t("ui.web.notifications.markAllRead")}
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="px-2 py-6 text-center text-muted-foreground text-sm">
            {t("ui.web.notifications.empty")}
          </div>
        ) : (
          items.map((item) => {
            const body = (
              <span className="flex flex-col gap-0.5">
                <span className="flex items-center gap-2">
                  {!item.read && (
                    <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                  )}
                  <span className="truncate font-medium">
                    {t(item.titleKey, item.params)}
                  </span>
                  {item.severity === "critical" && (
                    <Badge variant="destructive">!</Badge>
                  )}
                </span>
                {item.bodyKey && (
                  <span className="text-muted-foreground text-xs">
                    {t(item.bodyKey, item.params)}
                  </span>
                )}
              </span>
            );

            return (
              <DropdownMenuItem key={item.id} className="items-start">
                {item.href ? <Link href={item.href}>{body}</Link> : body}
              </DropdownMenuItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
