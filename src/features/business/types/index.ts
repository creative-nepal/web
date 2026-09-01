export type Sector = "mart" | "medical" | "restaurant";
export type BusinessStatus = "active" | "suspended" | "closed";

export interface Business {
  id: string;
  organizationId: string;
  sector: Sector;
  legalName: string;
  panNumber: string | null;
  vatRegistered: boolean;
  cbmsRequired: boolean;
  fiscalYearStartMonth: number;
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
