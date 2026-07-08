import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { ProtectedShell } from "@/components/DashboardShell";
import { getMyBookings } from "@/lib/services";
import { MyPets } from "@/components/MyPets";

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

function DashboardPage() {
  const { t } = useI18n();
  return (
    <ProtectedShell requireRole="client" title={t("dash_client_title")} intro={t("dash_client_intro")}>
      <MyBookings />
      <MyPets />
    </ProtectedShell>
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
                  <td className="py-3 pr-4">{b.arrival_date}</td>
                  <td className="py-3 pr-4">{b.departure_date}</td>
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
