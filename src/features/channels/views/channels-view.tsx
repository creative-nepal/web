"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/composed/empty-state";
import { PageHeader } from "@/components/composed/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { apiErrorMessage } from "@/lib/api-error";
import { money } from "@/lib/money";
import {
  channelPerformanceQueryOptions,
  channelQueryKeys,
  channelsQueryOptions,
} from "../queries";
import { createChannel, updateChannel } from "../services";

export function ChannelsView() {
  const { t } = useTranslation();

  const business = useCurrentBusiness();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [commission, setCommission] = useState("");

  const { data: channels } = useQuery(channelsQueryOptions(business?.id ?? ""));
  const { data: performance } = useQuery(
    channelPerformanceQueryOptions(business?.id ?? ""),
  );

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: channelQueryKeys.all });

  const add = useMutation({
    mutationFn: () =>
      createChannel(business?.id ?? "", {
        name: name.trim(),
        commissionPercent: Number(commission),
      }),
    onSuccess: () => {
      void invalidate();
      setName("");
      setCommission("");
      toast.success(t("ui.web.channels.added"));
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const toggle = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateChannel(business?.id ?? "", id, { isActive }),
    onSuccess: () => {
      void invalidate();
      toast.success(t("ui.web.channels.updated"));
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  if (!business) {
    return null;
  }

  const rows = channels?.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("ui.web.channels.title")}
        description={t("ui.web.channels.description")}
      />

      <Can permission={{ business: ["manage"] }}>
        <div className="flex flex-wrap items-end gap-2">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t("ui.web.channels.name")}
            className="max-w-52"
          />
          <Input
            type="number"
            min={0}
            max={100}
            step={0.5}
            value={commission}
            onChange={(event) => setCommission(event.target.value)}
            placeholder={t("ui.web.channels.commission")}
            className="max-w-40"
          />
          <Button
            disabled={!name.trim() || commission === "" || add.isPending}
            onClick={() => add.mutate()}
          >
            {t("ui.web.channels.add")}
          </Button>
        </div>
      </Can>

      {rows.length === 0 ? (
        <EmptyState
          title={t("ui.web.channels.empty")}
          description={t("ui.web.channels.emptyHint")}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("ui.web.channels.name")}</TableHead>
              <TableHead className="text-right">
                {t("ui.web.channels.commission")}
              </TableHead>
              <TableHead>{t("ui.field.status")}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((channel) => (
              <TableRow key={channel.id}>
                <TableCell className="font-medium">{channel.name}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {channel.commissionPercent}%
                </TableCell>
                <TableCell>
                  <Badge variant={channel.isActive ? "default" : "outline"}>
                    {channel.isActive
                      ? t("ui.web.channels.active")
                      : t("common.status.closed")}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Can permission={{ business: ["manage"] }}>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        toggle.mutate({
                          id: channel.id,
                          isActive: !channel.isActive,
                        })
                      }
                    >
                      {channel.isActive
                        ? t("ui.action.disable")
                        : t("ui.action.enable")}
                    </Button>
                  </Can>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {(performance?.length ?? 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("ui.web.channels.performance")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("ui.web.channels.channel")}</TableHead>
                  <TableHead className="text-right">
                    {t("ui.web.channels.orders")}
                  </TableHead>
                  <TableHead className="text-right">
                    {t("ui.web.channels.gross")}
                  </TableHead>
                  <TableHead className="text-right">
                    {t("ui.web.channels.commissionCost")}
                  </TableHead>
                  <TableHead className="text-right">
                    {t("ui.web.channels.net")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(performance ?? []).map((row) => (
                  <TableRow key={row.channelId ?? "direct"}>
                    <TableCell>
                      {row.channelId ? row.name : t("ui.web.channels.direct")}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.orders}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {money(row.grossCents)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.commissionCents > 0
                        ? `− ${money(row.commissionCents)}`
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {money(row.netCents)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
