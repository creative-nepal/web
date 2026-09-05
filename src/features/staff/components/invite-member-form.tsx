"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Can } from "@/features/business/components/can";
import { useTranslation } from "@/features/i18n/hooks/use-translation";

export interface RoleOption {
  value: string;
  label: string;
}

export function InviteMemberForm({
  email,
  role,
  roles,
  isPending,
  onEmailChange,
  onRoleChange,
  onInvite,
}: {
  email: string;
  role: string;
  roles: RoleOption[];
  isPending: boolean;
  onEmailChange: (email: string) => void;
  onRoleChange: (role: string) => void;
  onInvite: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Can permission={{ member: ["create"] }}>
      <div className="flex flex-wrap items-end gap-2">
        <Input
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          placeholder={t("ui.field.email")}
          className="max-w-xs"
        />
        <NativeSelect
          value={role}
          onChange={(event) => onRoleChange(event.target.value)}
          className="w-44"
          aria-label={t("ui.field.role")}
        >
          {roles.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <Button disabled={!email || isPending} onClick={onInvite}>
          {t("ui.web.staff.sendInvitation")}
        </Button>
      </div>
      <p className="text-muted-foreground text-sm">
        {t(`ui.web.staff.roleHelp.${role}`)}
      </p>
    </Can>
  );
}
