import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { AuthShell, AuthField, authInputCls, authBtnCls } from "@/components/AuthShell";

export const Route = createFileRoute("/login")({
  ssr: false,
  component: LoginPage,
});

function LoginPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user && role) {
      const to = role === "admin" ? "/admin" : role === "staff" ? "/staff" : "/dashboard";
      navigate({ to });
    }
  }, [user, role, loading, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!email || !password) {
      setErr(t("auth_err_required"));
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) {
      setErr(t("auth_err_login"));
      return;
    }
    // navigation happens via useEffect after role load
  };

  return (
    <AuthShell
      title={t("auth_login_title")}
      subtitle={t("auth_login_sub")}
      footer={
        <>
          {t("auth_no_account")}{" "}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            {t("auth_register_link")}
          </Link>
        </>
      }
    >
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
        <AuthField label={t("auth_password")}>
          <input
            type="password"
            autoComplete="current-password"
            className={authInputCls}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </AuthField>

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
            {t("auth_forgot_link")}
          </Link>
        </div>

        {err && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {err}
          </div>
        )}

        <button type="submit" className={authBtnCls} disabled={submitting}>
          {submitting ? t("auth_signing_in") : t("auth_login_btn")}
        </button>
      </form>
    </AuthShell>
  );
}
