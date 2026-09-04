"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/composed/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { useCurrentBusiness } from "@/features/business/business-provider";
import { Can } from "@/features/business/components/can";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { AreaDialog } from "../components/area-dialog";
import { BillDialog } from "../components/bill-dialog";
import { MoveDialog } from "../components/move-dialog";
import { tableStatusLabel } from "../constants";
import {
  restaurantQueryKeys,
  tableAreasQueryOptions,
  tablesQueryOptions,
} from "../queries";
import {
  closeTable,
  createTable,
  type RestaurantTable,
  updateTable,
} from "../services";

const UNASSIGNED = "__unassigned__";

export function TablesView() {
  const { t } = useTranslation();

  const business = useCurrentBusiness();
  const queryClient = useQueryClient();

  const [tableNo, setTableNo] = useState("");
  const [newAreaId, setNewAreaId] = useState("");
  const [managingAreas, setManagingAreas] = useState(false);
  const [billing, setBilling] = useState<RestaurantTable | null>(null);
  const [moving, setMoving] = useState<RestaurantTable | null>(null);

  const { data: tables } = useQuery(tablesQueryOptions(business?.id ?? ""));
  const { data: areas } = useQuery(tableAreasQueryOptions(business?.id ?? ""));

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: restaurantQueryKeys.all });

  const add = useMutation({
    mutationFn: () =>
      createTable(business?.id ?? "", {
        tableNo,
        ...(newAreaId ? { areaId: newAreaId } : {}),
      }),
    onSuccess: () => {
      setTableNo("");
      void invalidate();
    },
    onError: () => toast.error(t("ui.web.restaurant.tableExists")),
  });

  const assign = useMutation({
    mutationFn: (input: { tableId: string; areaId: string | null }) =>
      updateTable(business?.id ?? "", input.tableId, { areaId: input.areaId }),
    onSuccess: () => void invalidate(),
    onError: (error) =>
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? t("ui.error.generic"),
      ),
  });

  const close = useMutation({
    mutationFn: (tableId: string) => closeTable(business?.id ?? "", tableId),
    onSuccess: () => {
      void invalidate();
      toast.success(t("ui.web.restaurant.tableFreed"));
    },
  });

  const grouped = useMemo(() => {
    const byArea = new Map<string, RestaurantTable[]>();

    for (const table of tables ?? []) {
      const key = table.areaId ?? UNASSIGNED;
      byArea.set(key, [...(byArea.get(key) ?? []), table]);
    }

    const ordered = (areas ?? [])
      .filter((area) => byArea.has(area.id))
      .map((area) => ({ id: area.id, name: area.name }));

    return byArea.has(UNASSIGNED)
      ? [
          ...ordered,
          { id: UNASSIGNED, name: t("ui.web.restaurant.areaUnassigned") },
        ]
      : ordered;
  }, [tables, areas, t]);

  const tablesIn = (areaId: string) =>
    (tables ?? []).filter((table) => (table.areaId ?? UNASSIGNED) === areaId);

  if (!business) {
    return null;
  }

  const activeAreas = (areas ?? []).filter((area) => area.isActive);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("ui.web.restaurant.tablesTitle")}
        description={t("ui.web.restaurant.tablesDescription")}
        actions={
          <Can permission={{ table: ["manage"] }}>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setManagingAreas(true)}>
                {t("ui.web.restaurant.manageAreas")}
              </Button>
              <Input
                value={tableNo}
                onChange={(event) => setTableNo(event.target.value)}
                placeholder={t("ui.web.restaurant.tableNumber")}
                className="w-32"
              />
              {activeAreas.length > 0 && (
                <NativeSelect
                  value={newAreaId}
                  onChange={(event) => setNewAreaId(event.target.value)}
                  className="w-40"
                >
                  <NativeSelectOption value="">
                    {t("ui.web.restaurant.areaUnassigned")}
                  </NativeSelectOption>
                  {activeAreas.map((area) => (
                    <NativeSelectOption key={area.id} value={area.id}>
                      {area.name}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              )}
              <Button disabled={!tableNo} onClick={() => add.mutate()}>
                {t("ui.action.add")}
              </Button>
            </div>
          </Can>
        }
      />

      {grouped.map((area) => (
        <div key={area.id} className="flex flex-col gap-3">
          <div className="flex items-baseline gap-2">
            <h2 className="font-semibold text-sm">{area.name}</h2>
            <span className="text-muted-foreground text-xs">
              {t("ui.web.restaurant.areaTableCount", {
                count: tablesIn(area.id).length,
              })}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {tablesIn(area.id).map((table) => (
              <Card key={table.id}>
                <CardContent className="flex flex-col gap-3 py-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-lg">
                      {table.tableNo}
                    </span>
                    <Badge
                      variant={
                        table.status === "occupied"
                          ? "default"
                          : table.status === "billed"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {tableStatusLabel(table.status, t)}
                    </Badge>
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {t("ui.web.restaurant.seatCount", { count: table.seats })}
                  </span>

                  <Can permission={{ table: ["manage"] }}>
                    {activeAreas.length > 0 && (
                      <NativeSelect
                        value={table.areaId ?? ""}
                        onChange={(event) =>
                          assign.mutate({
                            tableId: table.id,
                            areaId: event.target.value || null,
                          })
                        }
                      >
                        <NativeSelectOption value="">
                          {t("ui.web.restaurant.areaUnassigned")}
                        </NativeSelectOption>
                        {activeAreas.map((entry) => (
                          <NativeSelectOption key={entry.id} value={entry.id}>
                            {entry.name}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                    )}
                  </Can>

                  {table.status === "occupied" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => setBilling(table)}
                      >
                        {t("ui.web.restaurant.billTable")}
                      </Button>
                      <Can permission={{ table: ["manage"] }}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setMoving(table)}
                        >
                          {t("ui.web.restaurant.move.action")}
                        </Button>
                      </Can>
                    </div>
                  )}
                  {table.status === "empty" && (
                    <Can permission={{ table: ["manage"] }}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setMoving(table)}
                      >
                        {t("ui.web.restaurant.move.receive")}
                      </Button>
                    </Can>
                  )}
                  {table.status === "billed" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => close.mutate(table.id)}
                    >
                      {t("ui.web.restaurant.paymentReceived")}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      <AreaDialog
        businessId={business.id}
        open={managingAreas}
        onOpenChange={setManagingAreas}
      />

      <BillDialog
        businessId={business.id}
        table={billing}
        onOpenChange={(open) => !open && setBilling(null)}
      />

      <MoveDialog
        businessId={business.id}
        table={moving}
        tables={tables ?? []}
        onOpenChange={(open) => !open && setMoving(null)}
      />
    </div>
  );
}
