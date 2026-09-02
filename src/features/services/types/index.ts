export interface ServiceItem {
  id: string;
  name: string;
  code: string | null;
  category: string | null;
  priceCents: number;
  durationMinutes: number;
  isVatable: boolean;
  sessionsPerPackage: number | null;
  isActive: boolean;
  createdAt: string;
}

export type MembershipStatus = "active" | "exhausted" | "expired" | "canceled";

export interface ServiceMembership {
  id: string;
  serviceItemId: string;
  customerId: string;
  startsAt: string;
  expiresAt: string | null;
  sessionsTotal: number;
  sessionsUsed: number;
  status: MembershipStatus;
  createdAt: string;
}

export interface CreateServiceItemInput {
  name: string;
  code?: string;
  category?: string;
  priceCents: number;
  durationMinutes?: number;
  isVatable?: boolean;
  sessionsPerPackage?: number;
}

export interface CreateMembershipInput {
  serviceItemId: string;
  customerId: string;
  sessionsTotal: number;
  startsAt?: string;
  expiresAt?: string;
}
