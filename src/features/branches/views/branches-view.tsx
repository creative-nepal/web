"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ContentDialog } from "@/components/composed/content-dialog";
import { EmptyState } from "@/components/composed/empty-state";
import { PageHeader } from "@/components/composed/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { branchesQueryOptions, branchQueryKeys } from "../queries";
import { createBranch, setBranchActive } from "../services";

function NewBranchDialog({
  businessId,
  onClose,
}: {
  businessId: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");

  const create = useMutation({
    mutationFn: () =>
      createBranch(businessId, {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        address: address.trim() || undefined,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: branchQueryKeys.all });
      toast.success(t("ui.web.branches.created"));
      onClose();
    },
    onError: (error) => {
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? t("ui.error.generic"),
      );
    },
  });

  return (
    <ContentDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={t("ui.web.branches.newTitle")}
      description={t("ui.web.branches.newHint")}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="branch-name">{t("ui.field.name")}</Label>
          <Input
            id="branch-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="branch-code">{t("ui.field.code")}</Label>
          <Input
            id="branch-code"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="LTP"
            maxLength={8}
          />
          <span className="text-muted-foreground text-xs">
            {t("ui.web.branches.codeHint")}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="branch-address">{t("ui.field.address")}</Label>
          <Input
            id="branch-address"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
          />
        </div>
        <Button
          onClick={() => create.mutate()}
          disabled={create.isPending || !name.trim() || !code.trim()}
        >
          {t("ui.web.branches.create")}
        </Button>
      </div>
    </ContentDialog>
  );
}

export function BranchesView() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const business = useCurrentBusiness();
  const [creating, setCreating] = useState(false);

  const { data, isFetching } = useQuery(
    branchesQueryOptions(business?.id ?? ""),
  );

  const toggle = useMutation({
    mutationFn: ({
      branchId,
      isActive,
    }: {
      branchId: string;
      isActive: boolean;
    }) => setBranchActive(business?.id ?? "", branchId, isActive),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: branchQueryKeys.all });
      toast.success(t("ui.web.branches.updated"));
    },
    onError: (error) => {
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? t("ui.error.generic"),
      );
    },
  });

  if (!business) {
    return null;
  }

  const rows = data?.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      {creating && (
        <NewBranchDialog
          businessId={business.id}
          onClose={() => setCreating(false)}
        />
      )}

      <PageHeader
        title={t("ui.web.branches.title")}
        description={t("ui.web.branches.description")}
        actions={
          <Can permission={{ business: ["manage"] }}>
            <Button onClick={() => setCreating(true)}>
              {t("ui.web.branches.create")}
            </Button>
          </Can>
        }
      />

      {!isFetching && rows.length === 0 ? (
        <EmptyState
          title={t("ui.web.branches.emptyTitle")}
          description={t("ui.web.branches.emptyBody")}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("ui.field.name")}</TableHead>
              <TableHead>{t("ui.field.code")}</TableHead>
              <TableHead>{t("ui.field.address")}</TableHead>
              <TableHead>{t("ui.field.status")}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((branch) => (
              <TableRow key={branch.id}>
                <TableCell className="font-medium">
                  {branch.name}
                  {branch.isDefault && (
                    <Badge variant="outline" className="ml-2">
                      {t("ui.web.branches.defaultBadge")}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="tabular-nums">
                  {branch.code ?? "—"}
                </TableCell>
                <TableCell>{branch.address ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={branch.isActive ? "outline" : "secondary"}>
                    {t(
                      `common.status.${branch.isActive ? "active" : "closed"}`,
                    )}
                  </Badge>
                </TableCell>
                <TableCell>
                  {!branch.isDefault && (
                    <div className="flex justify-end">
                      <Can permission={{ business: ["manage"] }}>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={toggle.isPending}
                          onClick={() =>
                            toggle.mutate({
                              branchId: branch.id,
                              isActive: !branch.isActive,
                            })
                          }
                        >
                          {t(
                            branch.isActive
                              ? "ui.web.branches.close"
                              : "ui.web.branches.reopen",
                          )}
                        </Button>
                      </Can>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
