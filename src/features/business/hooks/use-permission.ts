"use client";

import { authClient } from "@/lib/auth-client";
import { useBusinessContext } from "../business-provider";

type PermissionRequest = Record<string, string[]>;

export function usePermission(permissions: PermissionRequest): boolean {
  const { currentBusiness } = useBusinessContext();
  const { data: session } = authClient.useSession();

  if (!currentBusiness || !session) {
    return false;
  }

  const role = (session.user as { role?: string | null }).role;

  if (!role) {
    return true;
  }

  return authClient.organization.checkRolePermission({
    role: role as never,
    permissions: permissions as never,
  });
}
