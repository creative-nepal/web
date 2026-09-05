"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/composed/confirm-dialog";
import { EmptyState } from "@/components/composed/empty-state";
import { PageHeader } from "@/components/composed/page-header";
import { useCurrentBusiness } from "@/features/business/business-provider";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { useAssignableRoles } from "@/features/roles/hooks/use-assignable-roles";
import { BranchAccessDialog } from "../components/branch-access-dialog";
import { InviteMemberForm } from "../components/invite-member-form";
import { MembersTable } from "../components/members-table";
import { PendingInvitationsTable } from "../components/pending-invitations-table";
import {
  invitationsQueryOptions,
  membersQueryOptions,
  membersWithBranchesQueryOptions,
  staffQueryKeys,
} from "../queries";
import type { MemberWithBranches } from "../services";
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
  const { data: withBranches } = useQuery(
    membersWithBranchesQueryOptions(business?.id ?? "", ""),
  );
  const [assigning, setAssigning] = useState<MemberWithBranches | null>(null);

  const branchInfo = new Map(
    (withBranches?.data ?? []).map((entry) => [entry.userId, entry]),
  );
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

      <InviteMemberForm
        email={email}
        role={role}
        roles={roles}
        isPending={invite.isPending}
        onEmailChange={setEmail}
        onRoleChange={setRole}
        onInvite={() => invite.mutate()}
      />

      {(members ?? []).length === 0 ? (
        <EmptyState
          title={t("ui.web.staff.emptyTitle")}
          description={t("ui.web.staff.emptyBody")}
        />
      ) : (
        <MembersTable
          members={members ?? []}
          roles={roles}
          branchInfo={branchInfo}
          isChangingRole={changeRole.isPending}
          onChangeRole={(input) => changeRole.mutate(input)}
          onAssignBranches={setAssigning}
          onRemove={setRemoving}
        />
      )}

      <PendingInvitationsTable
        invitations={invitations ?? []}
        isRevoking={revokeInvite.isPending}
        onRevoke={(id) => revokeInvite.mutate(id)}
      />

      <BranchAccessDialog
        businessId={business?.id ?? ""}
        member={assigning}
        onOpenChange={(open) => !open && setAssigning(null)}
      />
    </div>
  );
}
