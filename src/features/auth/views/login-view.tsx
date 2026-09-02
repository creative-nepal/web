"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EmailField } from "@/components/form/email-field";
import { Form } from "@/components/form/form";
import { PasswordField } from "@/components/form/password-field";
import { GoogleIcon } from "@/components/google-icon";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { authClient } from "@/lib/auth-client";
import { type LoginInput, loginSchema } from "../schemas";

export function LoginView() {
  const { t } = useTranslation();

  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [googlePending, setGooglePending] = useState(false);

  async function handleSubmit(values: LoginInput) {
    setError(null);
    setPending(true);

    const { error: signInError } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
    });

    setPending(false);

    if (signInError) {
      setError(signInError.message ?? t("ui.auth.signInFailed"));
      return;
    }

    router.push("/");
  }

  async function handleGoogleSignIn() {
    setError(null);
    setGooglePending(true);

    const { error: signInError } = await authClient.signIn.social({
      provider: "google",
      callbackURL: `${window.location.origin}/`,
    });

    if (signInError) {
      setGooglePending(false);
      setError(signInError.message ?? t("ui.auth.googleSignInFailed"));
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t("ui.auth.signInTitle")}</CardTitle>
          <CardDescription>{t("ui.auth.signInSubtitleWeb")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form
            schema={loginSchema}
            defaultValues={{ email: "", password: "" }}
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            <EmailField name="email" label={t("ui.field.email")} />
            <PasswordField name="password" label={t("ui.field.password")} />
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              {t("ui.auth.forgotPasswordLink")}
            </Link>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "Signing in…" : "Sign in"}
            </Button>
          </Form>
          <div className="my-4 flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={googlePending}
            onClick={handleGoogleSignIn}
          >
            <GoogleIcon className="size-4" />
            {googlePending ? "Redirecting…" : "Continue with Google"}
          </Button>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="underline underline-offset-4 hover:text-foreground"
            >
              {t("ui.action.signUp")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
