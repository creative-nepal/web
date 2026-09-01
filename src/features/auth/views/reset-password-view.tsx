"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Form } from "@/components/form/form";
import { PasswordField } from "@/components/form/password-field";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { authClient } from "@/lib/auth-client";
import { type ResetPasswordInput, resetPasswordSchema } from "../schemas";

export function ResetPasswordView() {
  const { t } = useTranslation();

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(values: ResetPasswordInput) {
    if (!token) {
      setError("Reset link is missing or invalid.");
      return;
    }

    setError(null);
    setPending(true);

    const { error: resetError } = await authClient.resetPassword({
      newPassword: values.password,
      token,
    });

    setPending(false);

    if (resetError) {
      setError(resetError.message ?? "Unable to reset password");
      return;
    }

    router.push("/login");
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t("ui.auth.resetPassword")}</CardTitle>
          <CardDescription>
            {t("ui.auth.resetPasswordSubtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {token ? (
            <Form
              schema={resetPasswordSchema}
              defaultValues={{ password: "" }}
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
            >
              <PasswordField
                name="password"
                label={t("ui.field.newPassword")}
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
              <Button type="submit" disabled={pending} className="w-full">
                {pending ? "Resetting…" : "Reset password"}
              </Button>
            </Form>
          ) : (
            <p className="text-sm text-destructive">
              {t("ui.auth.resetLinkInvalid")}
            </p>
          )}
          <p className="mt-4 text-center text-xs text-muted-foreground">
            <Link
              href="/login"
              className="underline underline-offset-4 hover:text-foreground"
            >
              {t("ui.action.backToSignIn")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
