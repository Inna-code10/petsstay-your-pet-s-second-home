import { Link, useNavigate } from "@tanstack/react-router";
import { PawPrint, LogOut } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth, type AppRole } from "@/hooks/use-auth";
import { NotificationBell } from "@/components/NotificationBell";

const rank: Record<AppRole, number> = { client: 1, staff: 2, admin: 3 };

export function ProtectedShell({
  requireRole,
  title,
  intro,
  children,
}: {
  requireRole: AppRole;
  title: string;
  intro: string;
  children?: ReactNode;
}) {
  const { user, role, loading, signOut, fullName } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm">
        <div className="text-sm text-muted-foreground">{t("auth_loading")}</div>
      </div>
    );
  }

  const allowed = role && rank[role] >= rank[requireRole];
  if (!allowed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-warm px-4 text-center">
        <h1 className="text-3xl font-extrabold">{t("auth_denied_title")}</h1>
        <p className="mt-2 max-w-md text-muted-foreground">{t("auth_denied_sub")}</p>
        <div className="mt-6 flex gap-3">
          <Link to="/" className="rounded-full border border-border bg-white px-5 py-2.5 text-sm font-semibold">
            {t("auth_go_home")}
          </Link>
          <button
            onClick={async () => {
              await signOut();
              navigate({ to: "/" });
            }}
            className="rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-semibold"
          >
            {t("auth_logout")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm">
      <header className="border-b border-border bg-white/85 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <span
              className="inline-flex h-9 w-9 items-center justify-center rounded-2xl text-primary-foreground shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-sun)" }}
            >
              <PawPrint className="h-5 w-5" />
            </span>
            <span className="text-lg font-extrabold tracking-tight">
              Pet<span className="text-gradient">S</span>Stay
            </span>
          </Link>
          <div className="flex items-center gap-3">
            {fullName && (
              <span className="hidden sm:inline text-sm text-muted-foreground">
                {t("auth_hello")}, <span className="font-semibold text-foreground">{fullName}</span>
              </span>
            )}
            <button
              onClick={async () => {
                await signOut();
                navigate({ to: "/" });
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold hover:bg-cream"
            >
              <LogOut className="h-4 w-4" />
              {t("auth_logout")}
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="bg-white rounded-3xl shadow-[var(--shadow-card)] border border-border p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{title}</h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">{intro}</p>
          {children && <div className="mt-8">{children}</div>}
        </div>
      </main>
    </div>
  );
}
