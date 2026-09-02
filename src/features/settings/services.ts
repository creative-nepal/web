import type { Business } from "@/features/business/types";
import { api } from "@/lib/api";
export async function updateBranding(
  businessId: string,
  input: { displayName?: string; theme: Record<string, string> },
): Promise<Business> {
  const { data } = await api.patch<Business>(
    `/api/v1/businesses/${businessId}`,
    input,
  );
  return data;
}
