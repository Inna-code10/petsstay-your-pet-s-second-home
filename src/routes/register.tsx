import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { AuthShell, AuthField, authInputCls, authBtnCls } from "@/components/AuthShell";

export const Route = createFileRoute("/register")({
  ssr: false,
  component: RegisterPage,
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s()-]{5,}$/;

function RegisterPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalErr, setGlobalErr] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user && role && !success) {
      const to = role === "admin" ? "/admin" : role === "staff" ? "/staff" : "/dashboard";
      navigate({ to });
    }
  }, [user, role, loading, navigate, success]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = t("auth_err_required");
    if (!email.trim()) e.email = t("auth_err_required");
    else if (!EMAIL_RE.test(email)) e.email = t("auth_err_email");
    if (phone.trim() && !PHONE_RE.test(phone)) e.phone = t("auth_err_phone");
    if (!password) e.password = t("auth_err_required");
    else if (password.length < 8) e.password = t("auth_err_password_min");
    if (confirm !== password) e.confirm = t("auth_err_confirm");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalErr(null);
    if (!validate()) return;
    setSubmitting(true);
    const redirectTo = typeof window !== "undefined" ? window.location.origin : undefined;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: { full_name: fullName, phone: phone || null },
      },
    });
    setSubmitting(false);
    if (error) {
      setGlobalErr(t("auth_err_register"));
      return;
    }
    setSuccess(t("auth_register_success"));
  };

  return (
    <AuthShell
      title={t("auth_register_title")}
      subtitle={t("auth_register_sub")}
      footer={
        <>
          {t("auth_have_account")}{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            {t("auth_login_link")}
          </Link>
        </>
      }
    >
      {success ? (
        <div className="space-y-4">
          <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
            {success}
          </div>
          <Link to="/login" className={authBtnCls}>
            {t("auth_login_btn")}
          </Link>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <AuthField label={t("auth_full_name")} error={errors.fullName}>
            <input
              type="text"
              autoComplete="name"
              className={authInputCls}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Anna Georgiou"
            />
          </AuthField>
          <AuthField label={t("auth_email")} error={errors.email}>
            <input
              type="email"
              autoComplete="email"
              className={authInputCls}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </AuthField>
          <AuthField label={`${t("auth_phone")} (${t("cf_optional")})`} error={errors.phone}>
            <input
              type="tel"
              autoComplete="tel"
              className={authInputCls}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+357 …"
            />
          </AuthField>
          <AuthField label={t("auth_password")} error={errors.password}>
            <input
              type="password"
              autoComplete="new-password"
              className={authInputCls}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </AuthField>
          <AuthField label={t("auth_confirm_password")} error={errors.confirm}>
            <input
              type="password"
              autoComplete="new-password"
              className={authInputCls}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
            />
          </AuthField>

          {globalErr && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {globalErr}
            </div>
          )}

          <button type="submit" className={authBtnCls} disabled={submitting}>
            {submitting ? t("auth_signing_up") : t("auth_register_btn")}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
