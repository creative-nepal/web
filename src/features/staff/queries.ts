import { queryOptions } from "@tanstack/react-query";
import {
  listInvitations,
  listMembers,
  listMembersWithBranches,
} from "./services";

export const staffQueryKeys = {
  all: ["staff"] as const,
  members: (organizationId: string) =>
    [...staffQueryKeys.all, "members", organizationId] as const,
  invitations: (organizationId: string) =>
    [...staffQueryKeys.all, "invitations", organizationId] as const,
};

export function membersQueryOptions(organizationId: string) {
  return queryOptions({
    queryKey: staffQueryKeys.members(organizationId),
    queryFn: () => listMembers(organizationId),
    enabled: Boolean(organizationId),
  });
}

export function invitationsQueryOptions(organizationId: string) {
  return queryOptions({
    queryKey: staffQueryKeys.invitations(organizationId),
    queryFn: () => listInvitations(organizationId),
    enabled: Boolean(organizationId),
  });
}

export function membersWithBranchesQueryOptions(
  businessId: string,
  search: string,
) {
  return queryOptions({
    queryKey: [...staffQueryKeys.all, "members-branches", businessId, search],
    queryFn: () =>
      listMembersWithBranches(businessId, {
        ...(search ? { search } : {}),
      }),
    enabled: Boolean(businessId),
  });
}
