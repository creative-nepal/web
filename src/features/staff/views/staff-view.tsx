"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/composed/empty-state";
import { PageHeader } from "@/components/composed/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCurrentBusiness } from "@/features/business/business-provider";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { useAssignableRoles } from "@/features/roles/hooks/use-assignable-roles";
import { authClient } from "@/lib/auth-client";

export function StaffView() {
  const { t } = useTranslation();

  const business = useCurrentBusiness();
  const roles = useAssignableRoles();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("cashier");

  const { data: members } = useQuery({
    queryKey: ["members", business?.organizationId],
    queryFn: async () => {
      const { data } = await authClient.organization.getFullOrganization({
        query: { organizationId: business?.organizationId },
      });
      return data?.members ?? [];
    },
    enabled: Boolean(business?.organizationId),
  });

  const invite = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.organization.inviteMember({
        email,
        role: role as never,
        organizationId: business?.organizationId,
      });

      if (error) {
        throw new Error(error.message ?? "Invitation failed");
      }
    },
    onSuccess: () => {
      setEmail("");
      void queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success(t("ui.web.staff.invitationSent"));
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Invitation failed"),
  });

  if (!business) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("ui.web.staff.title")}
        description={t("ui.web.staff.description")}
      />

      <div className="flex flex-wrap items-end gap-2">
        <Input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={t("ui.web.staff.emailPlaceholder")}
          type="email"
          className="max-w-xs"
        />
        <Select
          value={role}
          onValueChange={(value) => setRole(value ?? "cashier")}
          items={roles}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {roles.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {(members ?? []).map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">
                  {member.user?.email ?? member.userId}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={member.role === "owner" ? "default" : "outline"}
                  >
                    {member.role}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
