"use client";

import Link from "next/link";
import { useState } from "react";
import { EmailField } from "@/components/form/email-field";
import { Form } from "@/components/form/form";
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
import { type ForgotPasswordInput, forgotPasswordSchema } from "../schemas";

export function ForgotPasswordView() {
  const { t } = useTranslation();

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(values: ForgotPasswordInput) {
    setError(null);
    setPending(true);

    const { error: requestError } = await authClient.requestPasswordReset({
      email: values.email,
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setPending(false);

    if (requestError) {
      setError(requestError.message ?? "Unable to send reset link");
      return;
    }

    setSent(true);
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t("ui.auth.forgotPassword")}</CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send you a reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <p className="text-sm text-muted-foreground">
              {t("ui.auth.forgotPasswordSent")}
            </p>
          ) : (
            <Form
              schema={forgotPasswordSchema}
              defaultValues={{ email: "" }}
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
            >
              <EmailField name="email" label={t("ui.field.email")} />
              {error && <p className="text-xs text-destructive">{error}</p>}
              <Button type="submit" disabled={pending} className="w-full">
                {pending ? "Sending…" : "Send reset link"}
              </Button>
            </Form>
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
