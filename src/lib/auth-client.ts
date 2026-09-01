import { passkeyClient } from "@better-auth/passkey/client";
import {
  emailOTPClient,
  lastLoginMethodClient,
  organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { LANGUAGE_HEADER } from "@/features/i18n/constants";
import { getCurrentLanguage } from "@/stores/language-store";
import { ac, roles } from "./access-control";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  fetchOptions: {
    onRequest: (context) => {
      context.headers.set(LANGUAGE_HEADER, getCurrentLanguage());
      return context;
    },
  },
  plugins: [
    emailOTPClient(),
    passkeyClient(),
    lastLoginMethodClient(),
    organizationClient({ ac, roles }),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
