import { Suspense } from "react";
import { ResetPasswordView } from "@/features/auth/views/reset-password-view";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordView />
    </Suspense>
  );
}
