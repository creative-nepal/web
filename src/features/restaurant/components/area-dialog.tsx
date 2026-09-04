"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ContentDialog } from "@/components/composed/content-dialog";
import { EmptyState } from "@/components/composed/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { restaurantQueryKeys, tableAreasQueryOptions } from "../queries";
import { createTableArea, deleteTableArea, updateTableArea } from "../services";

function errorMessage(error: unknown, fallback: string): string {
  return (
    (error as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ?? fallback
  );
}

export function AreaDialog({
  businessId,
  open,
  onOpenChange,
}: {
  businessId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");

  const { data: areas } = useQuery(tableAreasQueryOptions(businessId));

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: restaurantQueryKeys.all });

  const add = useMutation({
    mutationFn: () =>
      createTableArea(businessId, {
        name: name.trim(),
        sortOrder: (areas?.length ?? 0) + 1,
      }),
    onSuccess: () => {
      setName("");
      void invalidate();
    },
    onError: (error) =>
      toast.error(errorMessage(error, t("ui.web.restaurant.areaExists"))),
  });

  const rename = useMutation({
    mutationFn: (areaId: string) =>
      updateTableArea(businessId, areaId, { name: draftName.trim() }),
    onSuccess: () => {
      setEditing(null);
      void invalidate();
    },
    onError: (error) =>
      toast.error(errorMessage(error, t("ui.web.restaurant.areaExists"))),
  });

  const archive = useMutation({
    mutationFn: (area: { id: string; isActive: boolean }) =>
      updateTableArea(businessId, area.id, { isActive: !area.isActive }),
    onSuccess: () => void invalidate(),
    onError: (error) => toast.error(errorMessage(error, t("ui.error.generic"))),
  });

  const remove = useMutation({
    mutationFn: (areaId: string) => deleteTableArea(businessId, areaId),
    onSuccess: () => void invalidate(),
    onError: (error) =>
      toast.error(errorMessage(error, t("ui.web.restaurant.areaInUse"))),
  });

  return (
    <ContentDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("ui.web.restaurant.areasTitle")}
      description={t("ui.web.restaurant.areasDescription")}
    >
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t("ui.web.restaurant.areaNamePlaceholder")}
          />
          <Button
            disabled={!name.trim() || add.isPending}
            onClick={() => add.mutate()}
          >
            {t("ui.action.add")}
          </Button>
        </div>

        {(areas ?? []).length === 0 ? (
          <EmptyState
            title={t("ui.web.restaurant.noAreas")}
            description={t("ui.web.restaurant.noAreasHint")}
          />
        ) : (
          <div className="flex flex-col gap-2">
            {(areas ?? []).map((area) => (
              <div
                key={area.id}
                className="flex items-center gap-2 rounded-lg border p-2"
              >
                {editing === area.id ? (
                  <>
                    <Input
                      value={draftName}
                      onChange={(event) => setDraftName(event.target.value)}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      disabled={!draftName.trim()}
                      onClick={() => rename.mutate(area.id)}
                    >
                      {t("ui.action.save")}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditing(null)}
                    >
                      {t("ui.action.cancel")}
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 font-medium text-sm">
                      {area.name}
                    </span>
                    <Badge variant="outline">
                      {t("ui.web.restaurant.areaTableCount", {
                        count: area.tableCount,
                      })}
                    </Badge>
                    {!area.isActive && (
                      <Badge variant="secondary">
                        {t("ui.web.restaurant.areaArchived")}
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditing(area.id);
                        setDraftName(area.name);
                      }}
                    >
                      {t("ui.action.rename")}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        archive.mutate({
                          id: area.id,
                          isActive: area.isActive,
                        })
                      }
                    >
                      {area.isActive
                        ? t("ui.action.archive")
                        : t("ui.action.restore")}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={area.tableCount > 0}
                      onClick={() => remove.mutate(area.id)}
                    >
                      {t("ui.action.delete")}
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </ContentDialog>
  );
}
