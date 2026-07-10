// Sends transactional booking emails via Resend.
// Logs each attempt to public.email_deliveries with a unique constraint
// on (booking_id, event_type, recipient) for idempotency.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type EventType =
  | "booking_created"
  | "booking_confirmed"
  | "booking_cancelled"
  | "booking_completed";

type Lang = "en" | "ru" | "el";

interface Payload {
  booking_id: string;
  event_type: EventType;
  language?: Lang;
}

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAIL = Deno.env.get("PETSSTAY_ADMIN_EMAIL") || "";
const FROM_EMAIL =
  Deno.env.get("PETSSTAY_FROM_EMAIL") || "PetSStay <onboarding@resend.dev>";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function fmtDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

function pickLang(v: unknown): Lang {
  return v === "ru" || v === "el" ? v : "en";
}

/* ---------------- i18n ---------------- */

const T: Record<
  Lang,
  Record<string, string>
> = {
  en: {
    hi: "Hello",
    thanks_request: "Thank you! We received your booking request.",
    booking_confirmed: "Your booking is confirmed 🎉",
    booking_cancelled: "Your booking has been cancelled",
    booking_completed: "Thank you for staying with PetSStay!",
    review_invite:
      "We would love to hear about your experience — feel free to reply with a review.",
    prep_title: "Preparation tips",
    prep_body:
      "Please bring your pet's usual food, favourite toy, vaccination record and any medication.",
    cancel_body:
      "If you have any questions or would like to rebook, just reply to this email.",
    admin_subject_new: "New booking request",
    summary: "Booking summary",
    owner: "Owner",
    phone: "Phone",
    email: "Email",
    pet: "Pet",
    pets_count: "Number of pets",
    arrival: "Arrival",
    departure: "Departure",
    price: "Total price",
    status: "Status",
    message: "Special request",
    contact: "Contact",
    footer: "PetSStay — premium pet boarding",
    subj_created: "We received your booking request",
    subj_confirmed: "Your PetSStay booking is confirmed",
    subj_cancelled: "Your PetSStay booking was cancelled",
    subj_completed: "Thank you from PetSStay",
  },
  ru: {
    hi: "Здравствуйте",
    thanks_request: "Спасибо! Мы получили вашу заявку на бронирование.",
    booking_confirmed: "Ваше бронирование подтверждено 🎉",
    booking_cancelled: "Ваше бронирование отменено",
    booking_completed: "Спасибо, что были с PetSStay!",
    review_invite:
      "Будем рады отзыву о вашем опыте — просто ответьте на это письмо.",
    prep_title: "Подготовка",
    prep_body:
      "Пожалуйста, возьмите привычный корм, любимую игрушку, ветпаспорт и лекарства (если нужны).",
    cancel_body:
      "Если у вас есть вопросы или вы хотите перенести бронирование, ответьте на это письмо.",
    admin_subject_new: "Новая заявка на бронирование",
    summary: "Детали бронирования",
    owner: "Владелец",
    phone: "Телефон",
    email: "Email",
    pet: "Питомец",
    pets_count: "Количество питомцев",
    arrival: "Заезд",
    departure: "Выезд",
    price: "Стоимость",
    status: "Статус",
    message: "Пожелания",
    contact: "Контакты",
    footer: "PetSStay — премиальный отель для питомцев",
    subj_created: "Мы получили вашу заявку",
    subj_confirmed: "Ваше бронирование PetSStay подтверждено",
    subj_cancelled: "Ваше бронирование PetSStay отменено",
    subj_completed: "Спасибо от PetSStay",
  },
  el: {
    hi: "Γεια σας",
    thanks_request: "Ευχαριστούμε! Λάβαμε το αίτημα κράτησής σας.",
    booking_confirmed: "Η κράτησή σας επιβεβαιώθηκε 🎉",
    booking_cancelled: "Η κράτησή σας ακυρώθηκε",
    booking_completed: "Ευχαριστούμε που μείνατε στην PetSStay!",
    review_invite:
      "Θα χαρούμε να μάθουμε την εμπειρία σας — απαντήστε σε αυτό το email.",
    prep_title: "Προετοιμασία",
    prep_body:
      "Παρακαλούμε φέρτε τη συνηθισμένη τροφή, αγαπημένο παιχνίδι, βιβλιάριο εμβολιασμών και τυχόν φάρμακα.",
    cancel_body:
      "Για ερωτήσεις ή νέα κράτηση, απαντήστε σε αυτό το email.",
    admin_subject_new: "Νέο αίτημα κράτησης",
    summary: "Στοιχεία κράτησης",
    owner: "Ιδιοκτήτης",
    phone: "Τηλέφωνο",
    email: "Email",
    pet: "Κατοικίδιο",
    pets_count: "Αριθμός κατοικιδίων",
    arrival: "Άφιξη",
    departure: "Αναχώρηση",
    price: "Συνολική τιμή",
    status: "Κατάσταση",
    message: "Ειδικό αίτημα",
    contact: "Επικοινωνία",
    footer: "PetSStay — premium φιλοξενία κατοικιδίων",
    subj_created: "Λάβαμε το αίτημα κράτησής σας",
    subj_confirmed: "Η κράτηση PetSStay επιβεβαιώθηκε",
    subj_cancelled: "Η κράτηση PetSStay ακυρώθηκε",
    subj_completed: "Ευχαριστούμε από την PetSStay",
  },
};

/* ---------------- Template ---------------- */

function shell(inner: string, t: Record<string, string>): string {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f6f3ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#2a2a2a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f3ee;padding:24px 0">
<tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.04)">
<tr><td style="padding:28px 32px;background:#0f3d2e;color:#f6f3ee">
<div style="font-size:22px;font-weight:700;letter-spacing:0.5px">PetSStay</div>
<div style="font-size:12px;opacity:0.8;margin-top:4px">${escapeHtml(t.footer)}</div>
</td></tr>
<tr><td style="padding:28px 32px">${inner}</td></tr>
<tr><td style="padding:20px 32px;background:#faf7f2;font-size:12px;color:#7a7a7a">
${escapeHtml(t.contact)}: ${escapeHtml(ADMIN_EMAIL || "info@petsstay.com")}
</td></tr>
</table></td></tr></table></body></html>`;
}

function escapeHtml(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function summaryTable(b: BookingRow, t: Record<string, string>, admin = false): string {
  const row = (k: string, v: string) =>
    `<tr><td style="padding:6px 0;color:#7a7a7a;font-size:13px;width:45%">${escapeHtml(k)}</td><td style="padding:6px 0;font-size:14px;color:#2a2a2a">${escapeHtml(v)}</td></tr>`;
  const rows = [
    admin ? row(t.owner, b.owner_name) : null,
    admin ? row(t.phone, b.phone) : null,
    admin ? row(t.email, b.email) : null,
    row(t.pet, b.pet_type),
    row(t.pets_count, String(b.number_of_pets ?? 1)),
    row(t.arrival, fmtDate(b.arrival_date)),
    row(t.departure, fmtDate(b.departure_date)),
    b.total_price != null ? row(t.price, `€${b.total_price}`) : null,
    row(t.status, b.status || "new"),
    b.message ? row(t.message, b.message) : null,
  ]
    .filter(Boolean)
    .join("");
  return `<div style="margin:16px 0;padding:16px 18px;background:#faf7f2;border-radius:12px;border:1px solid #ece5da">
    <div style="font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#0f3d2e;margin-bottom:8px">${escapeHtml(t.summary)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
  </div>`;
}

interface BookingRow {
  id: string;
  owner_name: string;
  phone: string;
  email: string;
  pet_type: string;
  number_of_pets: number | null;
  arrival_date: string;
  departure_date: string;
  total_price: number | null;
  status: string | null;
  message: string | null;
  user_id: string | null;
  preferred_language: string | null;
}

function buildClient(event: EventType, b: BookingRow, t: Record<string, string>) {
  let heading = "";
  let body = "";
  let subject = "";
  switch (event) {
    case "booking_created":
      heading = t.thanks_request;
      body = "";
      subject = t.subj_created;
      break;
    case "booking_confirmed":
      heading = t.booking_confirmed;
      body = `<div style="margin-top:12px;padding:12px 14px;background:#eef6f0;border-radius:10px;color:#0f3d2e"><strong>${escapeHtml(t.prep_title)}</strong><br/>${escapeHtml(t.prep_body)}</div>`;
      subject = t.subj_confirmed;
      break;
    case "booking_cancelled":
      heading = t.booking_cancelled;
      body = `<p style="color:#555">${escapeHtml(t.cancel_body)}</p>`;
      subject = t.subj_cancelled;
      break;
    case "booking_completed":
      heading = t.booking_completed;
      body = `<p style="color:#555">${escapeHtml(t.review_invite)}</p>`;
      subject = t.subj_completed;
      break;
  }
  const inner = `<h1 style="font-size:22px;margin:0 0 8px;color:#0f3d2e">${escapeHtml(heading)}</h1>
    <p style="margin:0;color:#555">${escapeHtml(t.hi)} ${escapeHtml(b.owner_name)},</p>
    ${summaryTable(b, t)}
    ${body}`;
  return { subject, html: shell(inner, t) };
}

function buildAdmin(b: BookingRow, t: Record<string, string>) {
  const inner = `<h1 style="font-size:22px;margin:0 0 8px;color:#0f3d2e">${escapeHtml(t.admin_subject_new)}</h1>
    ${summaryTable(b, t, true)}`;
  return { subject: `[PetSStay] ${t.admin_subject_new} — ${b.owner_name}`, html: shell(inner, t) };
}

/* ---------------- Send + log ---------------- */

async function sendResend(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`resend ${res.status}: ${text.slice(0, 300)}`);
  try {
    return JSON.parse(text) as { id?: string };
  } catch {
    return {};
  }
}

async function deliver(
  booking_id: string,
  event_type: string,
  recipient: string,
  language: string,
  subject: string,
  html: string,
) {
  // Atomic reservation: try to INSERT first. The unique index on
  // (booking_id, event_type, recipient) makes this race-safe — two concurrent
  // callers cannot both reserve, and a duplicate call after a successful send
  // is rejected before we ever hit Resend.
  const { data: ins, error: insErr } = await admin
    .from("email_deliveries")
    .insert({
      booking_id,
      event_type,
      recipient,
      language,
      status: "pending",
    })
    .select("id")
    .maybeSingle();

  let rowId: string | undefined = ins?.id;

  if (insErr) {
    // 23505 = unique_violation. Someone else already reserved this delivery.
    const code = (insErr as { code?: string }).code;
    if (code !== "23505") throw insErr;

    const { data: existing } = await admin
      .from("email_deliveries")
      .select("id,status")
      .eq("booking_id", booking_id)
      .eq("event_type", event_type)
      .eq("recipient", recipient)
      .maybeSingle();

    if (!existing) return { skipped: true };
    // Already sent, or another worker owns the pending row — do not resend.
    if (existing.status === "sent" || existing.status === "pending") {
      return { skipped: true, reason: existing.status };
    }
    // Previous attempt failed — retry on the same row.
    rowId = existing.id;
    await admin
      .from("email_deliveries")
      .update({ status: "pending", error: null })
      .eq("id", rowId);
  }

  try {
    const r = await sendResend(recipient, subject, html);
    await admin
      .from("email_deliveries")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        provider_message_id: r.id ?? null,
        error: null,
      })
      .eq("id", rowId);
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await admin
      .from("email_deliveries")
      .update({
        status: "failed",
        failed_at: new Date().toISOString(),
        error: msg.slice(0, 500),
      })
      .eq("id", rowId);
    return { ok: false, error: msg };
  }
}

/* ---------------- Validation ---------------- */

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EVENTS: ReadonlySet<EventType> = new Set([
  "booking_created",
  "booking_confirmed",
  "booking_cancelled",
  "booking_completed",
]);

// Map each event to the booking.status it must reflect in the DB.
// booking_created is allowed regardless of starting status (typically "new").
const EVENT_REQUIRES_STATUS: Record<EventType, string | null> = {
  booking_created: null,
  booking_confirmed: "confirmed",
  booking_cancelled: "cancelled",
  booking_completed: "completed",
};

function bad(status: number, error: string) {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

/* ---------------- Handler ---------------- */

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return bad(405, "method_not_allowed");

  try {
    // Cap payload size — any legitimate payload is < 1KB.
    const raw = await req.text();
    if (raw.length > 2048) return bad(413, "payload_too_large");

    let body: Partial<Payload>;
    try {
      body = JSON.parse(raw);
    } catch {
      return bad(400, "invalid_json");
    }

    // Strict schema: only booking_id, event_type, language are read.
    // Recipient / subject / HTML / admin address are NEVER taken from payload.
    const booking_id = typeof body.booking_id === "string" ? body.booking_id : "";
    const event_type = body.event_type as EventType;
    if (!UUID_RE.test(booking_id)) return bad(400, "invalid_booking_id");
    if (!EVENTS.has(event_type)) return bad(400, "invalid_event_type");
    const lang: Lang = pickLang(body.language);

    // Load authoritative booking (service role, single id, safe columns only).
    const { data: booking, error } = await admin
      .from("bookings")
      .select(
        "id,owner_name,phone,email,pet_type,number_of_pets,arrival_date,departure_date,total_price,status,message,user_id",
      )
      .eq("id", booking_id)
      .maybeSingle();
    if (error) throw error;
    if (!booking) return bad(404, "booking_not_found");

    // Authorize the event against DB state. A client cannot trigger
    // confirmed / cancelled / completed unless staff/admin already updated
    // bookings.status via the RLS-protected UPDATE policy.
    const required = EVENT_REQUIRES_STATUS[event_type];
    if (required && booking.status !== required) {
      return bad(403, "event_not_authorized");
    }

    const t = T[lang];
    const results: Record<string, unknown> = {};

    // Client email — recipient always comes from the stored booking record.
    if (booking.email) {
      const { subject, html } = buildClient(event_type, booking as BookingRow, t);
      results.client = await deliver(
        booking.id,
        event_type,
        booking.email,
        lang,
        subject,
        html,
      );
    }

    // Admin email only on booking_created — recipient from server secret.
    if (event_type === "booking_created" && ADMIN_EMAIL) {
      const { subject, html } = buildAdmin(booking as BookingRow, t);
      results.admin = await deliver(
        booking.id,
        `${event_type}_admin`,
        ADMIN_EMAIL,
        lang,
        subject,
        html,
      );
    }

    return new Response(JSON.stringify({ ok: true, results }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("send-booking-email error:", msg);
    return bad(500, "internal_error");
  }
});
