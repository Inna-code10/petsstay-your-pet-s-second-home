import { useEffect, useRef, useState, useCallback } from "react";
import { Bell } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import {
  getMyNotifications,
  getAdminNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type NotificationRow,
} from "@/lib/services";

type Scope = "mine" | "operational";

function typeLabelKey(type: string): string {
  switch (type) {
    case "booking_created":
      return "notif_type_booking_created";
    case "booking_confirmed":
      return "notif_type_booking_confirmed";
    case "booking_cancelled":
      return "notif_type_booking_cancelled";
    case "booking_completed":
      return "notif_type_booking_completed";
    case "payment_pending":
      return "notif_type_payment_pending";
    default:
      return "notif_type_system";
  }
}

function fmtWhen(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

export function NotificationBell() {
  const { t } = useI18n();
  const { role, user } = useAuth();
  const scope: Scope = role === "staff" || role === "admin" ? "operational" : "mine";
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<NotificationRow[] | null>(null);
  const [error, setError] = useState("");
  const ref = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async () => {
    try {
      setError("");
      const data =
        scope === "operational" ? await getAdminNotifications(20) : await getMyNotifications(20);
      setRows(data);
    } catch (e) {
      console.error("[NotificationBell]", e);
      setError(t("notif_error"));
    }
  }, [scope, t]);

  useEffect(() => {
    if (!user) return;
    void load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, [user, load]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  if (!user) return null;

  const unread = (rows ?? []).filter((r) => !r.read_at).length;

  const onMark = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      await load();
    } catch (e) {
      console.error(e);
    }
  };
  const onMarkAll = async () => {
    try {
      await markAllNotificationsAsRead(scope);
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("notif_title")}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white hover:bg-cream"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-[340px] max-w-[92vw] rounded-2xl border border-border bg-white shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="font-semibold text-sm">{t("notif_title")}</span>
            <button
              onClick={onMarkAll}
              disabled={unread === 0}
              className="text-xs font-semibold text-primary disabled:opacity-40 hover:underline"
            >
              {t("notif_mark_all")}
            </button>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {error && <p className="p-4 text-sm text-destructive">{error}</p>}
            {!error && rows === null && (
              <p className="p-4 text-sm text-muted-foreground">{t("notif_loading")}</p>
            )}
            {!error && rows !== null && rows.length === 0 && (
              <p className="p-6 text-sm text-muted-foreground text-center">{t("notif_empty")}</p>
            )}
            {!error && rows && rows.length > 0 && (
              <ul>
                {rows.map((n) => {
                  const isUnread = !n.read_at;
                  return (
                    <li
                      key={n.id}
                      className={`px-4 py-3 border-b border-border/60 last:border-b-0 ${isUnread ? "bg-cream/40" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            {isUnread && <span className="h-2 w-2 rounded-full bg-primary" />}
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                              {t(typeLabelKey(n.type) as never)}
                            </span>
                          </div>
                          <div className="mt-1 text-sm font-semibold truncate">{n.title}</div>
                          {n.message && (
                            <div className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                              {n.message}
                            </div>
                          )}
                          <div className="mt-1 text-[11px] text-muted-foreground">
                            {fmtWhen(n.created_at)}
                          </div>
                        </div>
                        {isUnread && (
                          <button
                            onClick={() => onMark(n.id)}
                            className="text-[11px] font-semibold text-primary hover:underline whitespace-nowrap"
                          >
                            {t("notif_mark")}
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function NotificationsPanel({ scope }: { scope: Scope }) {
  const { t } = useI18n();
  const [rows, setRows] = useState<NotificationRow[] | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      const data =
        scope === "operational" ? await getAdminNotifications(30) : await getMyNotifications(30);
      setRows(data);
    } catch (e) {
      console.error("[NotificationsPanel]", e);
      setError(t("notif_error"));
    }
  }, [scope, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const unread = (rows ?? []).filter((r) => !r.read_at).length;

  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">{t("notif_title")}</h2>
        <button
          onClick={async () => {
            await markAllNotificationsAsRead(scope);
            await load();
          }}
          disabled={unread === 0}
          className="text-xs font-semibold text-primary disabled:opacity-40 hover:underline"
        >
          {t("notif_mark_all")}
        </button>
      </div>
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      {!error && rows === null && (
        <p className="mt-4 text-sm text-muted-foreground">{t("notif_loading")}</p>
      )}
      {!error && rows !== null && rows.length === 0 && (
        <p className="mt-4 text-sm text-muted-foreground">{t("notif_empty")}</p>
      )}
      {!error && rows && rows.length > 0 && (
        <ul className="mt-4 space-y-2">
          {rows.map((n) => {
            const isUnread = !n.read_at;
            return (
              <li
                key={n.id}
                className={`rounded-2xl border border-border bg-white p-4 shadow-sm ${isUnread ? "ring-1 ring-primary/30" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {isUnread && <span className="h-2 w-2 rounded-full bg-primary" />}
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {t(typeLabelKey(n.type) as never)}
                      </span>
                    </div>
                    <div className="mt-1 text-sm font-semibold">{n.title}</div>
                    {n.message && (
                      <div className="mt-0.5 text-sm text-muted-foreground">{n.message}</div>
                    )}
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      {fmtWhen(n.created_at)}
                    </div>
                  </div>
                  {isUnread && (
                    <button
                      onClick={async () => {
                        await markNotificationAsRead(n.id);
                        await load();
                      }}
                      className="text-xs font-semibold text-primary hover:underline whitespace-nowrap"
                    >
                      {t("notif_mark")}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
