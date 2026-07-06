import { Link } from "@tanstack/react-router";
import { PawPrint, Globe } from "lucide-react";
import type { ReactNode } from "react";
import { useI18n, type Lang } from "@/lib/i18n";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { lang, setLang } = useI18n();
  const langs: { code: Lang; label: string }[] = [
    { code: "en", label: "EN" },
    { code: "ru", label: "RU" },
    { code: "el", label: "EL" },
  ];
  return (
    <div className="min-h-screen bg-warm flex flex-col">
      <header className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
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
        <div className="inline-flex items-center rounded-full border border-border bg-white/80 backdrop-blur p-1 text-xs font-semibold">
          <Globe className="h-3.5 w-3.5 ml-2 mr-1 text-muted-foreground" />
          {langs.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`px-2.5 py-1 rounded-full transition-colors ${
                lang === l.code
                  ? "bg-foreground text-background"
                  : "text-foreground/70 hover:text-foreground"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-[var(--shadow-card)] border border-border p-8">
            <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
            <div className="mt-6">{children}</div>
          </div>
          {footer && <div className="mt-4 text-center text-sm text-muted-foreground">{footer}</div>}
        </div>
      </main>
    </div>
  );
}

export function AuthField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold mb-1.5">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>}
    </label>
  );
}

export const authInputCls =
  "w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

export const authBtnCls =
  "w-full btn-hero inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-60";
