import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { CalendarDays } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { ProtectedShell } from "@/components/DashboardShell";
import { getMyBookings, getBookingCalendarEvents } from "@/lib/services";
import { MyPets } from "@/components/MyPets";
import { Calendar } from "@/components/ui/calendar";
import { NotificationsPanel } from "@/components/NotificationBell";

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  component: DashboardPage,
});

type Booking = {
  id: string;
  pet_type: string;
  arrival_date: string;
  departure_date: string;
  total_price: number | null;
  status: string;
  created_at: string;
};

type CalendarEvent = {
  id: string;
  pet_type: string;
  arrival_date: string;
  departure_date: string;
  status: string;
};

function DashboardPage() {
  const { t } = useI18n();
  return (
    <ProtectedShell requireRole="client" title={t("dash_client_title")} intro={t("dash_client_intro")}>
      <UpcomingBookings />
      <div className="mt-12">
        <MyBookings />
      </div>
      <MyPets />
      <div className="mt-12">
        <NotificationsPanel scope="mine" />
      </div>
    </ProtectedShell>
  );
}

function fmt(iso: string) {
  try { return format(parseISO(iso), "dd/MM/yyyy"); } catch { return iso; }
}

function UpcomingBookings() {
  const { t } = useI18n();
  const [events, setEvents] = useState<CalendarEvent[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await getBookingCalendarEvents();
        if (!cancelled) setEvents(rows as CalendarEvent[]);
      } catch (e) {
        console.error("[UpcomingBookings]", e);
        if (!cancelled) setError(t("dash_bookings_error"));
      }
    })();
    return () => { cancelled = true; };
  }, [t]);

  const bookedDates = useMemo(() => {
    if (!events) return [] as Date[];
    const set = new Set<string>();
    for (const e of events) {
      const a = parseISO(e.arrival_date);
      const d = parseISO(e.departure_date);
      for (let cur = new Date(a); cur <= d; cur.setDate(cur.getDate() + 1)) {
        set.add(cur.toISOString().slice(0, 10));
      }
    }
    return Array.from(set).map((s) => parseISO(s));
  }, [events]);

  const statusLabel = (s: string) => {
    const key = `booking_status_${s}` as const;
    const v = t(key);
    return v === key ? s : v;
  };

  return (
    <section>
      <div className="flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-accent" />
        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">{t("dash_upcoming")}</h2>
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      {!error && events === null && (
        <p className="mt-4 text-sm text-muted-foreground">{t("dash_loading")}</p>
      )}

      {!error && events !== null && (
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-white p-3 shadow-sm inline-block">
            <Calendar
              mode="multiple"
              selected={bookedDates}
              onSelect={() => { /* read-only preview */ }}
              className="p-3 pointer-events-auto"
            />
            <p className="px-3 pb-2 text-xs text-muted-foreground">{t("dash_calendar")}</p>
          </div>

          <div>
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("dash_no_upcoming")}</p>
            ) : (
              <ul className="space-y-3">
                {events.map((b) => (
                  <li key={b.id} className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold capitalize">
                        {b.pet_type === "dog" ? t("book_dog") : b.pet_type === "cat" ? t("book_cat") : b.pet_type}
                      </div>
                      <span className="inline-flex items-center rounded-full bg-cream px-2.5 py-1 text-xs font-semibold">
                        {statusLabel(b.status)}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {fmt(b.arrival_date)} → {fmt(b.departure_date)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function MyBookings() {
  const { t } = useI18n();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await getMyBookings();
        if (!cancelled) setBookings(rows as Booking[]);
      } catch (e) {
        console.error("[MyBookings]", e);
        if (!cancelled) setError(t("dash_bookings_error"));
      }
    })();
    return () => { cancelled = true; };
  }, [t]);

  const statusLabel = (s: string) => {
    const key = `booking_status_${s}` as const;
    const v = t(key);
    return v === key ? s : v;
  };

  return (
    <section>
      <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">{t("dash_my_bookings")}</h2>

      {error && (
        <p className="mt-4 text-sm text-destructive">{error}</p>
      )}

      {!error && bookings === null && (
        <p className="mt-4 text-sm text-muted-foreground">{t("dash_loading")}</p>
      )}

      {!error && bookings !== null && bookings.length === 0 && (
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">{t("dash_no_bookings")}</p>
          <Link
            to="/"
            hash="book"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-semibold hover:opacity-90"
          >
            {t("dash_create_booking")}
          </Link>
        </div>
      )}

      {!error && bookings && bookings.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="py-2 pr-4">{t("dash_col_pet")}</th>
                <th className="py-2 pr-4">{t("dash_col_arrival")}</th>
                <th className="py-2 pr-4">{t("dash_col_departure")}</th>
                <th className="py-2 pr-4">{t("dash_col_price")}</th>
                <th className="py-2 pr-4">{t("dash_col_status")}</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-border/60">
                  <td className="py-3 pr-4 font-semibold capitalize">{b.pet_type}</td>
                  <td className="py-3 pr-4">{fmt(b.arrival_date)}</td>
                  <td className="py-3 pr-4">{fmt(b.departure_date)}</td>
                  <td className="py-3 pr-4">{b.total_price != null ? `€${b.total_price}` : "—"}</td>
                  <td className="py-3 pr-4">
                    <span className="inline-flex items-center rounded-full bg-cream px-2.5 py-1 text-xs font-semibold">
                      {statusLabel(b.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
