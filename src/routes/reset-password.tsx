import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { AuthShell, AuthField, authInputCls, authBtnCls } from "@/components/AuthShell";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (password.length < 8) return setErr(t("auth_err_password_min"));
    if (password !== confirm) return setErr(t("auth_err_confirm"));
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (error) return setErr(t("auth_err_generic"));
    setSuccess(true);
    setTimeout(() => navigate({ to: "/login" }), 1500);
  };

  return (
    <AuthShell
      title={t("auth_reset_title")}
      footer={
        <Link to="/login" className="font-semibold text-primary hover:underline">
          ← {t("auth_login_link")}
        </Link>
      }
    >
      {success ? (
        <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          {t("auth_reset_success")}
        </div>
      ) : (
        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <AuthField label={t("auth_password")}>
            <input
              type="password"
              autoComplete="new-password"
              className={authInputCls}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </AuthField>
          <AuthField label={t("auth_confirm_password")}>
            <input
              type="password"
              autoComplete="new-password"
              className={authInputCls}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </AuthField>
          {err && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {err}
            </div>
          )}
          <button type="submit" className={authBtnCls} disabled={submitting}>
            {submitting ? t("auth_sending") : t("auth_reset_btn")}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
