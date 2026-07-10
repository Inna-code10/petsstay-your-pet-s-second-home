import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { Search, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import {
  getBookings,
  updateBookingStatus,
  deleteBooking,
  getPetsForUsers,
  type BookingStatus,
} from "@/lib/services";

type Booking = {
  id: string;
  owner_name: string;
  phone: string;
  email: string;
  pet_type: string;
  number_of_pets: number;
  arrival_date: string;
  departure_date: string;
  total_price: number | null;
  message: string | null;
  status: BookingStatus;
  created_at: string;
  user_id: string | null;
};

type Pet = {
  id: string;
  user_id: string;
  pet_name: string;
  pet_type: string;
  breed: string | null;
  age: number | null;
  medical_notes: string | null;
  allergies: string | null;
  feeding_schedule: string | null;
};

const STATUSES: BookingStatus[] = ["new", "confirmed", "cancelled", "completed"];

function fmt(iso: string) {
  try { return format(parseISO(iso), "dd/MM/yyyy"); } catch { return iso; }
}
function fmtDT(iso: string) {
  try { return format(parseISO(iso), "dd/MM/yyyy HH:mm"); } catch { return iso; }
}

function statusClass(s: string) {
  switch (s) {
    case "new": return "bg-amber-100 text-amber-900";
    case "confirmed": return "bg-emerald-100 text-emerald-900";
    case "cancelled": return "bg-rose-100 text-rose-900";
    case "completed": return "bg-slate-200 text-slate-800";
    default: return "bg-cream text-foreground";
  }
}

export function BookingsManager({ allowDelete = false }: { allowDelete?: boolean }) {
  const { t, lang } = useI18n();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | BookingStatus>("all");
  const [petFilter, setPetFilter] = useState<"all" | "dog" | "cat">("all");
  const [busyId, setBusyId] = useState<string>("");
  const [openId, setOpenId] = useState<string>("");

  const load = async () => {
    try {
      setError("");
      const rows = (await getBookings()) as Booking[];
      setBookings(rows);
      const userIds = rows.map((r) => r.user_id).filter((v): v is string => !!v);
      if (userIds.length) {
        const p = (await getPetsForUsers(userIds)) as Pet[];
        setPets(p);
      } else {
        setPets([]);
      }
    } catch (e) {
      console.error("[BookingsManager] load", e);
      setError(t("crm_error"));
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    if (!bookings) return [] as Booking[];
    const term = q.trim().toLowerCase();
    return bookings
      .filter((b) => (statusFilter === "all" ? true : b.status === statusFilter))
      .filter((b) => (petFilter === "all" ? true : b.pet_type === petFilter))
      .filter((b) => {
        if (!term) return true;
        return (
          b.owner_name.toLowerCase().includes(term) ||
          b.phone.toLowerCase().includes(term) ||
          b.email.toLowerCase().includes(term)
        );
      });
  }, [bookings, q, statusFilter, petFilter]);

  const petsByUser = useMemo(() => {
    const m = new Map<string, Pet[]>();
    for (const p of pets) {
      const arr = m.get(p.user_id) ?? [];
      arr.push(p);
      m.set(p.user_id, arr);
    }
    return m;
  }, [pets]);

  const statusLabel = (s: string) => {
    const key = `booking_status_${s}` as const;
    const v = t(key);
    return v === key ? s : v;
  };

  const petTypeLabel = (s: string) =>
    s === "dog" ? t("book_dog") : s === "cat" ? t("book_cat") : s;

  const doUpdate = async (id: string, status: BookingStatus) => {
    try {
      setBusyId(id);
      setError("");
      await updateBookingStatus(id, status, lang);
      setBookings((prev) => prev?.map((b) => (b.id === id ? { ...b, status } : b)) ?? prev);
      setFlash(t("crm_success"));
      setTimeout(() => setFlash(""), 2500);
    } catch (e) {
      console.error("[BookingsManager] update", e);
      setError(t("crm_error"));
    } finally {
      setBusyId("");
    }
  };

  const doDelete = async (id: string) => {
    if (!confirm(t("admin_confirm_delete"))) return;
    try {
      setBusyId(id);
      setError("");
      await deleteBooking(id);
      setBookings((prev) => prev?.filter((b) => b.id !== id) ?? prev);
      setFlash(t("crm_success"));
      setTimeout(() => setFlash(""), 2500);
    } catch (e) {
      console.error("[BookingsManager] delete", e);
      setError(t("crm_error"));
    } finally {
      setBusyId("");
    }
  };

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">{t("crm_bookings")}</h2>
        <span className="text-xs text-muted-foreground">{t("crm_sort_newest")}</span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <label className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("crm_search_ph")}
            aria-label={t("crm_search")}
            className="w-full rounded-full border border-border bg-white pl-10 pr-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | BookingStatus)}
          aria-label={t("crm_status")}
          className="rounded-full border border-border bg-white px-4 py-2.5 text-sm shadow-sm"
        >
          <option value="all">{t("crm_status")}: {t("crm_all")}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{t("crm_status")}: {statusLabel(s)}</option>
          ))}
        </select>
        <select
          value={petFilter}
          onChange={(e) => setPetFilter(e.target.value as "all" | "dog" | "cat")}
          aria-label={t("crm_pet_type")}
          className="rounded-full border border-border bg-white px-4 py-2.5 text-sm shadow-sm"
        >
          <option value="all">{t("crm_pet_type")}: {t("crm_all")}</option>
          <option value="dog">{t("book_dog")}</option>
          <option value="cat">{t("book_cat")}</option>
        </select>
      </div>

      {flash && (
        <p className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2 text-sm text-emerald-900">
          {flash}
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-xl bg-rose-50 border border-rose-200 px-4 py-2 text-sm text-rose-900">
          {error}
        </p>
      )}

      {bookings === null && !error && (
        <p className="mt-6 text-sm text-muted-foreground">{t("crm_loading")}</p>
      )}

      {bookings !== null && filtered.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">{t("crm_no_bookings")}</p>
      )}

      {bookings !== null && filtered.length > 0 && (
        <ul className="mt-6 space-y-4">
          {filtered.map((b) => {
            const isOpen = openId === b.id;
            const linkedPets = b.user_id ? petsByUser.get(b.user_id) ?? [] : [];
            const busy = busyId === b.id;
            return (
              <li key={b.id} className="rounded-2xl border border-border bg-white p-4 md:p-5 shadow-sm">
                <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold truncate">{b.owner_name}</span>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClass(b.status)}`}>
                        {statusLabel(b.status)}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-cream px-2.5 py-0.5 text-xs font-semibold capitalize">
                        {petTypeLabel(b.pet_type)}{b.number_of_pets > 1 ? ` ×${b.number_of_pets}` : ""}
                      </span>
                      {b.user_id && (
                        <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-semibold">
                          {t("crm_client")}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
                      <div><span className="text-foreground/70">{t("crm_phone")}:</span> {b.phone}</div>
                      <div className="truncate"><span className="text-foreground/70">{t("crm_email")}:</span> {b.email}</div>
                      <div><span className="text-foreground/70">{t("crm_arrival")}:</span> {fmt(b.arrival_date)}</div>
                      <div><span className="text-foreground/70">{t("crm_departure")}:</span> {fmt(b.departure_date)}</div>
                      {b.total_price != null && (
                        <div><span className="text-foreground/70">{t("crm_price")}:</span> €{Number(b.total_price).toFixed(2)}</div>
                      )}
                      <div><span className="text-foreground/70">{t("crm_created")}:</span> {fmtDT(b.created_at)}</div>
                    </div>
                    {b.message && (
                      <div className="mt-2 text-sm">
                        <span className="text-foreground/70">{t("crm_message")}:</span> {b.message}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 md:justify-end">
                    <button
                      disabled={busy || b.status === "confirmed"}
                      onClick={() => doUpdate(b.id, "confirmed")}
                      className="rounded-full bg-emerald-600 text-white px-3.5 py-1.5 text-xs font-semibold hover:opacity-90 disabled:opacity-50"
                    >
                      {busy ? t("crm_updating") : t("crm_confirm")}
                    </button>
                    <button
                      disabled={busy || b.status === "cancelled"}
                      onClick={() => doUpdate(b.id, "cancelled")}
                      className="rounded-full bg-rose-600 text-white px-3.5 py-1.5 text-xs font-semibold hover:opacity-90 disabled:opacity-50"
                    >
                      {t("crm_cancel")}
                    </button>
                    <button
                      disabled={busy || b.status === "completed"}
                      onClick={() => doUpdate(b.id, "completed")}
                      className="rounded-full bg-foreground text-background px-3.5 py-1.5 text-xs font-semibold hover:opacity-90 disabled:opacity-50"
                    >
                      {t("crm_complete")}
                    </button>
                    {allowDelete && (
                      <button
                        disabled={busy}
                        onClick={() => doDelete(b.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-rose-300 text-rose-700 px-3.5 py-1.5 text-xs font-semibold hover:bg-rose-50 disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {t("admin_delete")}
                      </button>
                    )}
                  </div>
                </div>

                {linkedPets.length > 0 && (
                  <div className="mt-3 border-t border-border pt-3">
                    <button
                      onClick={() => setOpenId(isOpen ? "" : b.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      {isOpen ? t("crm_hide") : t("crm_details")} — {t("crm_linked_pets")} ({linkedPets.length})
                    </button>
                    {isOpen && (
                      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                        {linkedPets.map((p) => (
                          <li key={p.id} className="rounded-xl bg-warm p-3 text-sm">
                            <div className="font-semibold">{p.pet_name} <span className="text-xs text-muted-foreground capitalize">({petTypeLabel(p.pet_type)})</span></div>
                            {p.breed && <div><span className="text-foreground/70">{t("crm_pet_breed")}:</span> {p.breed}</div>}
                            {p.age != null && <div><span className="text-foreground/70">{t("crm_pet_age")}:</span> {p.age}</div>}
                            {p.medical_notes && <div><span className="text-foreground/70">{t("crm_pet_medical")}:</span> {p.medical_notes}</div>}
                            {p.allergies && <div><span className="text-foreground/70">{t("crm_pet_allergies")}:</span> {p.allergies}</div>}
                            {p.feeding_schedule && <div><span className="text-foreground/70">{t("crm_pet_feeding")}:</span> {p.feeding_schedule}</div>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
