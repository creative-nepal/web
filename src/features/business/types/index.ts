export type Sector = "mart" | "medical" | "restaurant" | "services";
export type BusinessStatus = "active" | "suspended" | "closed";

export interface Business {
  id: string;
  organizationId: string;
  sector: Sector;
  legalName: string;
  panNumber: string | null;
  vatRegistered: boolean;
  cbmsRequired: boolean;
  serviceChargePercent: number;
  maxDiscountPercent: number;
  loyaltyPointsPerHundred: number;
  loyaltyPointValueCents: number;
  referralRewardPoints: number;
  referralWelcomePoints: number;
  fiscalYearStartMonth: number;
  displayName: string | null;
  theme: {
    primary?: string;
    primaryForeground?: string;
    accent?: string;
    radius?: string;
    logoUrl?: string;
    defaultMode?: "light" | "dark" | "system";
  };
  status: BusinessStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Entitlements {
  businessId: string;
  planKey: string | null;
  planName: string | null;
  status: string | null;
  currentPeriodEnd: string | null;
  featureFlags: Record<string, unknown>;
}

export const NAV_GROUPS = ["counter", "stock", "money", "setup"] as const;
export type NavGroup = (typeof NAV_GROUPS)[number];

export interface WorkspaceNavItem {
  key: string;
  group: NavGroup;
  href: string;
  titleKey: string;
}

export type EffectivePermissions = Record<string, string[]>;

export interface WorkspaceBranding {
  displayName: string;
  theme: {
    primary?: string;
    primaryForeground?: string;
    accent?: string;
    radius?: string;
    logoUrl?: string;
    defaultMode?: "light" | "dark" | "system";
  };
}

export interface Workspace {
  business: Business;
  branding: WorkspaceBranding;
  membership: { role: string };
  permissions: EffectivePermissions;
  nav: WorkspaceNavItem[];
}
