"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { branchesQueryOptions } from "@/features/branches/queries";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { apiErrorMessage } from "@/lib/api-error";
import { staffQueryKeys } from "../queries";
import { type MemberWithBranches, setMemberBranches } from "../services";

export function BranchAccessDialog({
  businessId,
  member,
  onOpenChange,
}: {
  businessId: string;
  member: MemberWithBranches | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();

  const queryClient = useQueryClient();
  const { data: branches } = useQuery(branchesQueryOptions(businessId));
  const [selected, setSelected] = useState<string[]>([]);
  const [seeded, setSeeded] = useState<string | null>(null);

  if (member && seeded !== member.memberId) {
    setSeeded(member.memberId);
    setSelected(member.branchIds);
  }

  const save = useMutation({
    mutationFn: () =>
      setMemberBranches(businessId, member?.memberId ?? "", selected),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: staffQueryKeys.all });
      toast.success(t("ui.web.staff.branchesUpdated"));
      onOpenChange(false);
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const toggle = (branchId: string) =>
    setSelected((current) =>
      current.includes(branchId)
        ? current.filter((entry) => entry !== branchId)
        : [...current, branchId],
    );

  return (
    <Dialog open={member !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("ui.web.staff.assignTitle", {
              name: member?.name || member?.email || "",
            })}
          </DialogTitle>
          <DialogDescription>{t("ui.web.staff.assignHint")}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          {(branches?.data ?? []).map((branch) => (
            <Label
              key={branch.id}
              className="flex items-center gap-2 rounded-lg border p-3 font-normal"
            >
              <Checkbox
                checked={selected.includes(branch.id)}
                onCheckedChange={() => toggle(branch.id)}
              />
              <span className="flex-1">{branch.name}</span>
              {branch.isDefault && (
                <span className="text-muted-foreground text-xs">
                  {t("ui.web.branches.defaultBadge")}
                </span>
              )}
            </Label>
          ))}
          {selected.length === 0 && (
            <p className="text-muted-foreground text-xs">
              {t("ui.web.staff.allBranches")}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button disabled={save.isPending} onClick={() => save.mutate()}>
            {t("ui.action.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
