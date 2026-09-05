"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Can } from "@/features/business/components/can";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import type { MemberWithBranches } from "../services";
import type { RoleOption } from "./invite-member-form";

interface Member {
  id: string;
  userId: string;
  email: string;
  name?: string | null;
  role: string;
}

export function MembersTable({
  members,
  roles,
  branchInfo,
  isChangingRole,
  onChangeRole,
  onAssignBranches,
  onRemove,
}: {
  members: Member[];
  roles: RoleOption[];
  branchInfo: Map<string, MemberWithBranches>;
  isChangingRole: boolean;
  onChangeRole: (input: { memberId: string; role: string }) => void;
  onAssignBranches: (member: MemberWithBranches) => void;
  onRemove: (member: { id: string; email: string }) => void;
}) {
  const { t } = useTranslation();

  const branchLabel = (userId: string) => {
    const entry = branchInfo.get(userId);

    return entry?.allBranches === false
      ? t("ui.web.staff.restricted", { count: entry.branchIds.length })
      : t("ui.web.staff.allBranches");
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("ui.web.staff.member")}</TableHead>
          <TableHead>{t("ui.field.role")}</TableHead>
          <TableHead>{t("ui.web.staff.branches")}</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => (
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
                    disabled={isChangingRole}
                    onChange={(event) =>
                      onChangeRole({
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
              <Can
                permission={{ member: ["update"] }}
                fallback={
                  <span className="text-muted-foreground text-sm">
                    {branchLabel(member.userId)}
                  </span>
                }
              >
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const entry = branchInfo.get(member.userId);

                    if (entry) {
                      onAssignBranches(entry);
                    }
                  }}
                >
                  {branchLabel(member.userId)}
                </Button>
              </Can>
            </TableCell>
            <TableCell>
              {member.role !== "owner" && (
                <div className="flex justify-end">
                  <Can permission={{ member: ["delete"] }}>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        onRemove({ id: member.id, email: member.email })
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
  );
}
