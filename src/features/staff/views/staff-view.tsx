"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/composed/confirm-dialog";
import { EmptyState } from "@/components/composed/empty-state";
import { PageHeader } from "@/components/composed/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
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
import { useAssignableRoles } from "@/features/roles/hooks/use-assignable-roles";
import {
  invitationsQueryOptions,
  membersQueryOptions,
  staffQueryKeys,
} from "../queries";
import {
  cancelInvitation,
  changeMemberRole,
  inviteMember,
  removeMember,
} from "../services";

export function StaffView() {
  const { t } = useTranslation();
  const business = useCurrentBusiness();
  const roles = useAssignableRoles();
  const queryClient = useQueryClient();
  const organizationId = business?.organizationId ?? "";

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("cashier");
  const [removing, setRemoving] = useState<{
    id: string;
    email: string;
  } | null>(null);

  const { data: members } = useQuery(membersQueryOptions(organizationId));
  const { data: invitations } = useQuery(
    invitationsQueryOptions(organizationId),
  );

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: staffQueryKeys.all });
  }

  function reportError(error: unknown) {
    toast.error(error instanceof Error ? error.message : t("ui.error.generic"));
  }

  const invite = useMutation({
    mutationFn: () => inviteMember(organizationId, email, role),
    onSuccess: () => {
      setEmail("");
      refresh();
      toast.success(t("ui.web.staff.invitationSent"));
    },
    onError: reportError,
  });

  const changeRole = useMutation({
    mutationFn: (input: { memberId: string; role: string }) =>
      changeMemberRole(organizationId, input.memberId, input.role),
    onSuccess: () => {
      refresh();
      toast.success(t("ui.web.staff.roleChanged"));
    },
    onError: reportError,
  });

  const remove = useMutation({
    mutationFn: (memberId: string) => removeMember(organizationId, memberId),
    onSuccess: () => {
      setRemoving(null);
      refresh();
      toast.success(t("ui.web.staff.memberRemoved"));
    },
    onError: reportError,
  });

  const revokeInvite = useMutation({
    mutationFn: (invitationId: string) => cancelInvitation(invitationId),
    onSuccess: () => {
      refresh();
      toast.success(t("ui.web.staff.invitationRevoked"));
    },
    onError: reportError,
  });

  if (!business) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      {removing && (
        <ConfirmDialog
          open
          onOpenChange={(open) => {
            if (!open) setRemoving(null);
          }}
          title={t("ui.web.staff.removeTitle")}
          description={t("ui.web.staff.removeBody", { email: removing.email })}
          confirmLabel={t("ui.web.staff.remove")}
          onConfirm={() => remove.mutate(removing.id)}
        />
      )}

      <PageHeader
        title={t("ui.web.staff.title")}
        description={t("ui.web.staff.description")}
      />

      <Can permission={{ member: ["create"] }}>
        <div className="flex flex-wrap items-end gap-2">
          <Input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={t("ui.field.email")}
            className="max-w-xs"
          />
          <NativeSelect
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="w-44"
            aria-label={t("ui.field.role")}
          >
            {roles.map((option) => (
              <NativeSelectOption key={option.value} value={option.value}>
                {option.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <Button
            disabled={!email || invite.isPending}
            onClick={() => invite.mutate()}
          >
            {t("ui.web.staff.sendInvitation")}
          </Button>
        </div>
        <p className="text-muted-foreground text-sm">
          {t(`ui.web.staff.roleHelp.${role}`)}
        </p>
      </Can>

      {(members ?? []).length === 0 ? (
        <EmptyState
          title={t("ui.web.staff.emptyTitle")}
          description={t("ui.web.staff.emptyBody")}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("ui.web.staff.member")}</TableHead>
              <TableHead>{t("ui.field.role")}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {(members ?? []).map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">
                  {member.email}
                  {member.name && (
                    <span className="block text-muted-foreground text-xs">
                      {member.name}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {member.role === "owner" ? (
                    <Badge>{t("common.role.owner")}</Badge>
                  ) : (
                    <Can
                      permission={{ member: ["update"] }}
                      fallback={<Badge variant="outline">{member.role}</Badge>}
                    >
                      <NativeSelect
                        value={member.role}
                        disabled={changeRole.isPending}
                        onChange={(event) =>
                          changeRole.mutate({
                            memberId: member.id,
                            role: event.target.value,
                          })
                        }
                        className="w-40"
                        aria-label={t("ui.field.role")}
                      >
                        {roles.map((option) => (
                          <NativeSelectOption
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                    </Can>
                  )}
                </TableCell>
                <TableCell>
                  {member.role !== "owner" && (
                    <div className="flex justify-end">
                      <Can permission={{ member: ["delete"] }}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setRemoving({ id: member.id, email: member.email })
                          }
                        >
                          {t("ui.web.staff.remove")}
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

      {(invitations ?? []).length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="font-medium text-sm">
            {t("ui.web.staff.pendingTitle")}
          </span>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("ui.field.email")}</TableHead>
                <TableHead>{t("ui.field.role")}</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {(invitations ?? []).map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell className="font-medium">
                    {invitation.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{invitation.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <Can permission={{ invitation: ["cancel"] }}>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={revokeInvite.isPending}
                          onClick={() => revokeInvite.mutate(invitation.id)}
                        >
                          {t("ui.web.staff.revoke")}
                        </Button>
                      </Can>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
