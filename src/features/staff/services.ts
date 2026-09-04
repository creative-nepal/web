import { api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import type { PaginatedResult } from "@/types/api";

export interface StaffMember {
  id: string;
  userId: string;
  role: string;
  email: string;
  name: string | null;
}

export interface PendingInvitation {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
}

function unwrap<T>(result: {
  data: unknown;
  error: { message?: string } | null;
}): T {
  if (result.error) {
    throw new Error(result.error.message ?? "Request failed");
  }

  return result.data as T;
}

export async function listMembers(
  organizationId: string,
): Promise<StaffMember[]> {
  const data = unwrap<{
    members?: Array<{
      id: string;
      userId: string;
      role: string;
      user?: { email?: string; name?: string };
    }>;
  }>(
    await authClient.organization.getFullOrganization({
      query: { organizationId },
    }),
  );

  return (data.members ?? []).map((member) => ({
    id: member.id,
    userId: member.userId,
    role: member.role,
    email: member.user?.email ?? member.userId,
    name: member.user?.name ?? null,
  }));
}

export async function listInvitations(
  organizationId: string,
): Promise<PendingInvitation[]> {
  const data = unwrap<PendingInvitation[]>(
    await authClient.organization.listInvitations({
      query: { organizationId },
    }),
  );

  return (data ?? []).filter((invite) => invite.status === "pending");
}

export async function inviteMember(
  organizationId: string,
  email: string,
  role: string,
): Promise<void> {
  unwrap(
    await authClient.organization.inviteMember({
      email,
      role: role as never,
      organizationId,
    }),
  );
}

export async function changeMemberRole(
  organizationId: string,
  memberId: string,
  role: string,
): Promise<void> {
  unwrap(
    await authClient.organization.updateMemberRole({
      memberId,
      role: role as never,
      organizationId,
    }),
  );
}

export async function removeMember(
  organizationId: string,
  memberIdOrEmail: string,
): Promise<void> {
  unwrap(
    await authClient.organization.removeMember({
      memberIdOrEmail,
      organizationId,
    }),
  );
}

export async function cancelInvitation(invitationId: string): Promise<void> {
  unwrap(await authClient.organization.cancelInvitation({ invitationId }));
}

export interface MemberWithBranches {
  memberId: string;
  userId: string;
  role: string;
  name: string;
  email: string;
  joinedAt: string;
  branchIds: string[];
  allBranches: boolean;
}

export async function listMembersWithBranches(
  businessId: string,
  params: { search?: string; limit?: number } = {},
): Promise<PaginatedResult<MemberWithBranches>> {
  const { data } = await api.get<PaginatedResult<MemberWithBranches>>(
    `/api/v1/businesses/${businessId}/members`,
    { params: { limit: 50, ...params } },
  );
  return data;
}

export async function setMemberBranches(
  businessId: string,
  memberId: string,
  branchIds: string[],
): Promise<MemberWithBranches> {
  const { data } = await api.put<MemberWithBranches>(
    `/api/v1/businesses/${businessId}/members/${memberId}/branches`,
    { branchIds },
  );
  return data;
}
