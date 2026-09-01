import { LANGUAGE_HEADER } from "@/features/i18n/constants";
import { createApiClient } from "@/lib/api-client/axios";
import { getCurrentBusinessId } from "@/stores/business-store";
import { getCurrentLanguage } from "@/stores/language-store";

export const api = createApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "",
  getAuthHeaders: (): Record<string, string> => {
    const businessId = getCurrentBusinessId();

    return {
      [LANGUAGE_HEADER]: getCurrentLanguage(),
      ...(businessId ? { "X-Business-Id": businessId } : {}),
    };
  },
});
