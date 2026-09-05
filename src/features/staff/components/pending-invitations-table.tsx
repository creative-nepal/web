"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Can } from "@/features/business/components/can";
import { useTranslation } from "@/features/i18n/hooks/use-translation";

export interface PendingInvitation {
  id: string;
  email: string;
  role: string;
}

export function PendingInvitationsTable({
  invitations,
  isRevoking,
  onRevoke,
}: {
  invitations: PendingInvitation[];
  isRevoking: boolean;
  onRevoke: (invitationId: string) => void;
}) {
  const { t } = useTranslation();

  if (invitations.length === 0) {
    return null;
  }

  return (
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
          {invitations.map((invitation) => (
            <TableRow key={invitation.id}>
              <TableCell className="font-medium">{invitation.email}</TableCell>
              <TableCell>
                <Badge variant="secondary">{invitation.role}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex justify-end">
                  <Can permission={{ invitation: ["cancel"] }}>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={isRevoking}
                      onClick={() => onRevoke(invitation.id)}
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
  );
}
