export interface Branch {
  id: string;
  businessId: string;
  teamId: string | null;
  name: string;
  code: string | null;
  address: string | null;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface CreateBranchInput {
  name: string;
  code: string;
  address?: string;
}
