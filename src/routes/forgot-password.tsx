import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { AuthShell, AuthField, authInputCls, authBtnCls } from "@/components/AuthShell";

export const Route = createFileRoute("/forgot-password")({
  ssr: false,
  component: ForgotPasswordPage,
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ForgotPasswordPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!EMAIL_RE.test(email)) {
      setErr(t("auth_err_email"));
      return;
    }
    setSubmitting(true);
    const redirectTo =
      typeof window !== "undefined" ? `${window.location.origin}/reset-password` : undefined;
    // Do not reveal whether email exists — always show success.
    await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    setSubmitting(false);
    setSuccess(true);
  };

  return (
    <AuthShell
      title={t("auth_forgot_title")}
      subtitle={t("auth_forgot_sub")}
      footer={
        <Link to="/login" className="font-semibold text-primary hover:underline">
          ← {t("auth_login_link")}
        </Link>
      }
    >
      {success ? (
        <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          {t("auth_forgot_success")}
        </div>
      ) : (
        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <AuthField label={t("auth_email")}>
            <input
              type="email"
              autoComplete="email"
              className={authInputCls}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </AuthField>

          {err && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {err}
            </div>
          )}

          <button type="submit" className={authBtnCls} disabled={submitting}>
            {submitting ? t("auth_sending") : t("auth_forgot_btn")}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
