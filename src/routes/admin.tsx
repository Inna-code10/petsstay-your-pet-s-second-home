import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  XCircle,
  PawPrint,
  Users,
  Wallet,
  ClipboardList,
  Search,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { ProtectedShell } from "@/components/DashboardShell";
import { BookingsManager } from "@/components/BookingsManager";
import { NotificationsPanel } from "@/components/NotificationBell";
import {
  getAdminStats,
  getClientsOverview,
  getPetsOverview,
  type AdminStats,
} from "@/lib/services";

export const Route = createFileRoute("/admin")({
  ssr: false,
  component: AdminPage,
});

function AdminPage() {
  const { t } = useI18n();
  return (
    <ProtectedShell requireRole="admin" title={t("dash_admin_title")} intro={t("dash_admin_intro")}>
      <AdminDashboard />
    </ProtectedShell>
  );
}

type Tab = "bookings" | "clients" | "pets";

function AdminDashboard() {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>("bookings");

  return (
    <div>
      <StatsGrid />

      <div className="mt-10 flex flex-wrap gap-2 border-b border-border">
        {(["bookings", "clients", "pets"] as Tab[]).map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`rounded-t-xl px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition ${
              tab === k
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t(`admin_tab_${k}` as const)}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "bookings" && <BookingsManager allowDelete />}
        {tab === "clients" && <ClientsTable />}
        {tab === "pets" && <PetsTable />}
      </div>

      <div className="mt-12">
        <NotificationsPanel scope="operational" />
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}>
          {icon}
        </span>
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground truncate">{label}</div>
          <div className="text-xl font-extrabold tracking-tight">{value}</div>
        </div>
      </div>
    </div>
  );
}

function StatsGrid() {
  const { t } = useI18n();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await getAdminStats();
        if (!cancelled) setStats(s);
      } catch (e) {
        console.error("[Admin stats]", e);
        if (!cancelled) setError(t("crm_error"));
      }
    })();
    return () => { cancelled = true; };
  }, [t]);

  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!stats) return <p className="text-sm text-muted-foreground">{t("crm_loading")}</p>;

  return (
    <section>
      <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">{t("admin_stats")}</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard icon={<ClipboardList className="h-5 w-5 text-white" />} label={t("admin_stat_total")} value={stats.total} accent="bg-foreground" />
        <StatCard icon={<Clock className="h-5 w-5 text-amber-900" />} label={t("admin_stat_new")} value={stats.new} accent="bg-amber-100" />
        <StatCard icon={<CalendarCheck className="h-5 w-5 text-emerald-900" />} label={t("admin_stat_confirmed")} value={stats.confirmed} accent="bg-emerald-100" />
        <StatCard icon={<CheckCircle2 className="h-5 w-5 text-slate-700" />} label={t("admin_stat_completed")} value={stats.completed} accent="bg-slate-200" />
        <StatCard icon={<XCircle className="h-5 w-5 text-rose-900" />} label={t("admin_stat_cancelled")} value={stats.cancelled} accent="bg-rose-100" />
        <StatCard icon={<Users className="h-5 w-5 text-primary" />} label={t("admin_stat_clients")} value={stats.clients} accent="bg-primary/10" />
        <StatCard icon={<PawPrint className="h-5 w-5 text-primary" />} label={t("admin_stat_pets")} value={stats.pets} accent="bg-primary/10" />
        <StatCard icon={<Wallet className="h-5 w-5 text-emerald-900" />} label={t("admin_stat_revenue")} value={`€${stats.revenue.toFixed(2)}`} accent="bg-emerald-100" />
      </div>
    </section>
  );
}

type ClientRow = {
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
  bookings_count: number;
  pets_count: number;
};

function ClientsTable() {
  const { t } = useI18n();
  const [rows, setRows] = useState<ClientRow[] | null>(null);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = (await getClientsOverview()) as ClientRow[];
        if (!cancelled) setRows(r);
      } catch (e) {
        console.error("[Admin clients]", e);
        if (!cancelled) setError(t("crm_error"));
      }
    })();
    return () => { cancelled = true; };
  }, [t]);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter(
      (r) =>
        (r.full_name ?? "").toLowerCase().includes(term) ||
        (r.email ?? "").toLowerCase().includes(term),
    );
  }, [rows, q]);

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">{t("admin_clients")}</h2>
      </div>

      <label className="relative mt-4 block max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("admin_search_clients")}
          className="w-full rounded-full border border-border bg-white pl-10 pr-4 py-2.5 text-sm shadow-sm"
        />
      </label>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      {rows === null && !error && <p className="mt-6 text-sm text-muted-foreground">{t("crm_loading")}</p>}
      {rows !== null && filtered.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">{t("admin_no_clients")}</p>
      )}

      {filtered.length > 0 && (
        <>
          <div className="mt-4 hidden md:block overflow-x-auto rounded-2xl border border-border bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-cream text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">{t("admin_client_name")}</th>
                  <th className="px-4 py-3">{t("admin_client_email")}</th>
                  <th className="px-4 py-3">{t("admin_client_phone")}</th>
                  <th className="px-4 py-3 text-center">{t("admin_client_pets")}</th>
                  <th className="px-4 py-3 text-center">{t("admin_client_bookings")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.user_id} className="border-t border-border">
                    <td className="px-4 py-3 font-semibold">{c.full_name || "—"}</td>
                    <td className="px-4 py-3">{c.email || "—"}</td>
                    <td className="px-4 py-3">{c.phone || "—"}</td>
                    <td className="px-4 py-3 text-center">{c.pets_count}</td>
                    <td className="px-4 py-3 text-center">{c.bookings_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="mt-4 space-y-3 md:hidden">
            {filtered.map((c) => (
              <li key={c.user_id} className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                <div className="font-semibold">{c.full_name || "—"}</div>
                <div className="mt-1 text-sm text-muted-foreground">{c.email || "—"}</div>
                <div className="text-sm text-muted-foreground">{c.phone || "—"}</div>
                <div className="mt-2 flex gap-2 text-xs">
                  <span className="rounded-full bg-cream px-2 py-0.5 font-semibold">
                    {t("admin_client_pets")}: {c.pets_count}
                  </span>
                  <span className="rounded-full bg-cream px-2 py-0.5 font-semibold">
                    {t("admin_client_bookings")}: {c.bookings_count}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

type PetRow = {
  id: string;
  pet_name: string;
  pet_type: string;
  breed: string | null;
  age: number | null;
  vaccination_status: string | null;
  allergies: string | null;
  medical_notes: string | null;
  owner: { full_name: string | null; email: string | null } | null;
};

function PetsTable() {
  const { t } = useI18n();
  const [rows, setRows] = useState<PetRow[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = (await getPetsOverview()) as PetRow[];
        if (!cancelled) setRows(r);
      } catch (e) {
        console.error("[Admin pets]", e);
        if (!cancelled) setError(t("crm_error"));
      }
    })();
    return () => { cancelled = true; };
  }, [t]);

  const petTypeLabel = (s: string) =>
    s === "dog" ? t("book_dog") : s === "cat" ? t("book_cat") : s;

  return (
    <section>
      <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">{t("admin_pets")}</h2>
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      {rows === null && !error && <p className="mt-6 text-sm text-muted-foreground">{t("crm_loading")}</p>}
      {rows !== null && rows.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">{t("admin_no_pets")}</p>
      )}
      {rows && rows.length > 0 && (
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {rows.map((p) => (
            <li key={p.id} className="rounded-2xl border border-border bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold">{p.pet_name}</div>
                  <div className="text-xs text-muted-foreground capitalize">{petTypeLabel(p.pet_type)}{p.breed ? ` · ${p.breed}` : ""}</div>
                </div>
                {p.age != null && (
                  <span className="rounded-full bg-cream px-2.5 py-0.5 text-xs font-semibold">
                    {t("crm_pet_age")}: {p.age}
                  </span>
                )}
              </div>
              <div className="mt-2 grid gap-1 text-sm text-muted-foreground">
                {p.owner && (
                  <div>
                    <span className="text-foreground/70">{t("admin_pet_owner")}:</span>{" "}
                    {p.owner.full_name || p.owner.email || "—"}
                  </div>
                )}
                {p.vaccination_status && (
                  <div><span className="text-foreground/70">{t("admin_pet_vaccination")}:</span> {p.vaccination_status}</div>
                )}
                {p.allergies && (
                  <div><span className="text-foreground/70">{t("crm_pet_allergies")}:</span> {p.allergies}</div>
                )}
                {p.medical_notes && (
                  <div><span className="text-foreground/70">{t("crm_pet_medical")}:</span> {p.medical_notes}</div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

