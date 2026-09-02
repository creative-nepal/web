"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EmailField } from "@/components/form/email-field";
import { Form } from "@/components/form/form";
import { PasswordField } from "@/components/form/password-field";
import { TextField } from "@/components/form/text-field";
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
import { type RegisterInput, registerSchema } from "../schemas";

export function RegisterView() {
  const { t } = useTranslation();

  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(values: RegisterInput) {
    setError(null);
    setPending(true);

    const { error: signUpError } = await authClient.signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
    });

    setPending(false);

    if (signUpError) {
      setError(signUpError.message ?? t("ui.auth.registerFailed"));
      return;
    }

    router.push("/");
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t("ui.auth.registerTitle")}</CardTitle>
          <CardDescription>{t("ui.auth.registerSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form
            schema={registerSchema}
            defaultValues={{ name: "", email: "", password: "" }}
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            <TextField name="name" label={t("ui.field.name")} />
            <EmailField name="email" label={t("ui.field.email")} />
            <PasswordField name="password" label={t("ui.field.password")} />
            {error && <p className="text-xs text-destructive">{error}</p>}
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "Creating account…" : "Create account"}
            </Button>
          </Form>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="underline underline-offset-4 hover:text-foreground"
            >
              {t("ui.auth.signInTitle")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
