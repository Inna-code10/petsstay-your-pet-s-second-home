import { supabase } from "@/integrations/supabase/client";

/* --------------------------- Types --------------------------- */

export type BookingInput = {
  owner_name: string;
  phone: string;
  email: string;
  pet_type: "dog" | "cat" | string;
  number_of_pets?: number;
  arrival_date: string; // YYYY-MM-DD
  departure_date: string; // YYYY-MM-DD
  additional_services?: string[];
  total_price?: number | null;
  message?: string | null;
};

export type ContactInput = {
  full_name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
};

/* --------------------------- Validation --------------------------- */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s\-()]{5,}$/;

const sanitize = (s: string | null | undefined) => (s ?? "").toString().trim().slice(0, 2000);

export type ValidationError = { field: string; code: string };

export function validateBooking(input: BookingInput): ValidationError[] {
  const errs: ValidationError[] = [];
  if (!sanitize(input.owner_name)) errs.push({ field: "owner_name", code: "required" });
  if (!sanitize(input.phone)) errs.push({ field: "phone", code: "required" });
  else if (!PHONE_RE.test(input.phone.trim())) errs.push({ field: "phone", code: "phone" });
  if (!sanitize(input.email)) errs.push({ field: "email", code: "required" });
  else if (!EMAIL_RE.test(input.email.trim())) errs.push({ field: "email", code: "email" });
  if (!input.arrival_date) errs.push({ field: "arrival_date", code: "required" });
  if (!input.departure_date) errs.push({ field: "departure_date", code: "required" });
  if (input.arrival_date && input.departure_date && input.arrival_date > input.departure_date) {
    errs.push({ field: "departure_date", code: "dates" });
  }
  return errs;
}

export function validateContact(input: ContactInput): ValidationError[] {
  const errs: ValidationError[] = [];
  if (!sanitize(input.full_name)) errs.push({ field: "full_name", code: "required" });
  if (!sanitize(input.email)) errs.push({ field: "email", code: "required" });
  else if (!EMAIL_RE.test(input.email.trim())) errs.push({ field: "email", code: "email" });
  if (!sanitize(input.message)) errs.push({ field: "message", code: "required" });
  if (input.phone && !PHONE_RE.test(input.phone.trim())) errs.push({ field: "phone", code: "phone" });
  return errs;
}

/* --------------------------- Mutations --------------------------- */

export async function createBooking(input: BookingInput, language?: string) {
  const errs = validateBooking(input);
  if (errs.length) throw new Error("validation_failed");

  // Attach user_id when a session is available (anonymous bookings are still allowed).
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id ?? null;

  const lang = language === "ru" || language === "el" ? language : "en";

  const payload = {
    owner_name: sanitize(input.owner_name),
    phone: sanitize(input.phone),
    email: sanitize(input.email).toLowerCase(),
    pet_type: sanitize(input.pet_type),
    number_of_pets: Math.max(1, Number(input.number_of_pets) || 1),
    arrival_date: input.arrival_date,
    departure_date: input.departure_date,
    additional_services: input.additional_services ?? [],
    total_price: input.total_price ?? null,
    message: input.message ? sanitize(input.message) : null,
    user_id: userId,
    preferred_language: lang,
  };

  // Do NOT chain .select() here: for anonymous bookings there is no SELECT
  // policy that matches the newly-inserted row (client SELECT policy requires
  // user_id = auth.uid()), so PostgREST's return=representation fails the RLS
  // check on the RETURNING clause and surfaces as
  // "new row violates row-level security policy". The INSERT itself succeeds.
  const { error } = await supabase.from("bookings").insert(payload);
  if (error) {
    if (import.meta.env.DEV) {
      // Surface the exact Postgres/PostgREST error during development so
      // future failures are diagnosable — user still sees the localized
      // message from the form.
      console.error("[createBooking] insert failed", error);
    }
    throw error;
  }
  // Email delivery is triggered server-side by a database trigger (pg_net) —
  // no fire-and-forget browser call needed.
  return { ok: true };
}


export async function getMyBookings() {
  const { data: sessionData } = await supabase.auth.getSession();
  const uid = sessionData.session?.user?.id;
  if (!uid) return [];
  const { data, error } = await supabase
    .from("bookings")
    .select("id, pet_type, arrival_date, departure_date, total_price, status, created_at")
    .eq("user_id", uid)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getBookingCalendarEvents() {
  const { data: sessionData } = await supabase.auth.getSession();
  const uid = sessionData.session?.user?.id;
  if (!uid) return [];
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("bookings")
    .select("id, pet_type, arrival_date, departure_date, status")
    .eq("user_id", uid)
    .gte("departure_date", today)
    .neq("status", "cancelled")
    .order("arrival_date", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createContactMessage(input: ContactInput) {
  const errs = validateContact(input);
  if (errs.length) throw new Error("validation_failed");

  const payload = {
    full_name: sanitize(input.full_name),
    email: sanitize(input.email).toLowerCase(),
    phone: input.phone ? sanitize(input.phone) : null,
    subject: input.subject ? sanitize(input.subject) : null,
    message: sanitize(input.message),
  };

  const { error } = await supabase.from("contacts").insert(payload);
  if (error) throw error;
  return { ok: true };
}

/* --------------------------- Queries (staff/admin) --------------------------- */

export type BookingStatus = "new" | "confirmed" | "cancelled" | "completed";

export async function getBookings() {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function updateBookingStatus(id: string, status: BookingStatus, _language?: string) {
  const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
  if (error) throw error;
  // Status-change emails are dispatched server-side by a database trigger.
  return { ok: true };
}

export async function getBookingDetails(id: string) {
  const { data, error } = await supabase.from("bookings").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getPetsForUsers(userIds: string[]) {
  const ids = Array.from(new Set(userIds.filter(Boolean)));
  if (ids.length === 0) return [];
  const { data, error } = await supabase.from("pets").select("*").in("user_id", ids);
  if (error) throw error;
  return data ?? [];
}

/* --------------------------- Admin --------------------------- */

export type AdminStats = {
  total: number;
  new: number;
  confirmed: number;
  cancelled: number;
  completed: number;
  clients: number;
  pets: number;
  revenue: number;
};

export async function getAdminStats(): Promise<AdminStats> {
  const [bookingsRes, profilesRes, petsRes] = await Promise.all([
    supabase.from("bookings").select("status,total_price"),
    supabase.from("profiles").select("user_id", { count: "exact", head: true }),
    supabase.from("pets").select("id", { count: "exact", head: true }),
  ]);
  if (bookingsRes.error) throw bookingsRes.error;
  if (profilesRes.error) throw profilesRes.error;
  if (petsRes.error) throw petsRes.error;
  const rows = bookingsRes.data ?? [];
  const stats: AdminStats = {
    total: rows.length,
    new: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0,
    clients: profilesRes.count ?? 0,
    pets: petsRes.count ?? 0,
    revenue: 0,
  };
  for (const r of rows) {
    const s = (r.status as keyof AdminStats) ?? "new";
    if (s === "new" || s === "confirmed" || s === "cancelled" || s === "completed") {
      (stats[s] as number) += 1;
    }
    if (r.status === "confirmed" || r.status === "completed") {
      stats.revenue += Number(r.total_price) || 0;
    }
  }
  return stats;
}

export async function getClientsOverview() {
  const [profilesRes, bookingsRes, petsRes] = await Promise.all([
    supabase.from("profiles").select("user_id,full_name,email,phone,created_at").order("created_at", { ascending: false }),
    supabase.from("bookings").select("user_id"),
    supabase.from("pets").select("user_id"),
  ]);
  if (profilesRes.error) throw profilesRes.error;
  if (bookingsRes.error) throw bookingsRes.error;
  if (petsRes.error) throw petsRes.error;
  const bookingCount = new Map<string, number>();
  for (const b of bookingsRes.data ?? []) {
    if (!b.user_id) continue;
    bookingCount.set(b.user_id, (bookingCount.get(b.user_id) ?? 0) + 1);
  }
  const petCount = new Map<string, number>();
  for (const p of petsRes.data ?? []) {
    if (!p.user_id) continue;
    petCount.set(p.user_id, (petCount.get(p.user_id) ?? 0) + 1);
  }
  return (profilesRes.data ?? []).map((p) => ({
    ...p,
    bookings_count: bookingCount.get(p.user_id) ?? 0,
    pets_count: petCount.get(p.user_id) ?? 0,
  }));
}

export async function getPetsOverview() {
  const [petsRes, profilesRes] = await Promise.all([
    supabase.from("pets").select("*").order("created_at", { ascending: false }),
    supabase.from("profiles").select("user_id,full_name,email"),
  ]);
  if (petsRes.error) throw petsRes.error;
  if (profilesRes.error) throw profilesRes.error;
  const owners = new Map<string, { full_name: string | null; email: string | null }>();
  for (const p of profilesRes.data ?? []) {
    owners.set(p.user_id, { full_name: p.full_name, email: p.email });
  }
  return (petsRes.data ?? []).map((p) => ({
    ...p,
    owner: p.user_id ? owners.get(p.user_id) ?? null : null,
  }));
}

export async function deleteBooking(id: string) {
  const { error } = await supabase.from("bookings").delete().eq("id", id);
  if (error) throw error;
  return { ok: true };
}


export async function getContactMessages() {
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

/* --------------------------- Pets --------------------------- */

export type PetInput = {
  pet_name: string;
  pet_type: "dog" | "cat" | string;
  breed?: string | null;
  age?: number | null;
  weight?: number | null;
  gender?: string | null;
  photo_url?: string | null;
  vaccination_status?: string | null;
  medical_notes?: string | null;
  allergies?: string | null;
  feeding_schedule?: string | null;
  behavior_notes?: string | null;
  emergency_contact?: string | null;
};

const URL_RE = /^https?:\/\/[^\s]+$/i;

export function validatePet(input: PetInput): ValidationError[] {
  const errs: ValidationError[] = [];
  if (!sanitize(input.pet_name)) errs.push({ field: "pet_name", code: "required" });
  if (!sanitize(input.pet_type)) errs.push({ field: "pet_type", code: "required" });
  if (input.age != null && input.age !== ("" as unknown as number)) {
    const n = Number(input.age);
    if (!Number.isFinite(n) || n < 0 || n > 40) errs.push({ field: "age", code: "invalid" });
  }
  if (input.weight != null && input.weight !== ("" as unknown as number)) {
    const n = Number(input.weight);
    if (!Number.isFinite(n) || n <= 0 || n > 200) errs.push({ field: "weight", code: "invalid" });
  }
  if (input.photo_url && !URL_RE.test(input.photo_url.trim())) {
    errs.push({ field: "photo_url", code: "url" });
  }
  return errs;
}

function normalizePet(input: PetInput) {
  const opt = (s?: string | null) => (s && sanitize(s) ? sanitize(s) : null);
  const num = (n?: number | null) => {
    if (n == null || (n as unknown) === "") return null;
    const v = Number(n);
    return Number.isFinite(v) ? v : null;
  };
  return {
    pet_name: sanitize(input.pet_name),
    pet_type: sanitize(input.pet_type),
    breed: opt(input.breed),
    age: num(input.age),
    weight: num(input.weight),
    gender: opt(input.gender),
    photo_url: input.photo_url ? sanitize(input.photo_url) : null,
    vaccination_status: opt(input.vaccination_status),
    medical_notes: opt(input.medical_notes),
    allergies: opt(input.allergies),
    feeding_schedule: opt(input.feeding_schedule),
    behavior_notes: opt(input.behavior_notes),
    emergency_contact: opt(input.emergency_contact),
  };
}

export async function getMyPets() {
  const { data: sessionData } = await supabase.auth.getSession();
  const uid = sessionData.session?.user?.id;
  if (!uid) return [];
  const { data, error } = await supabase
    .from("pets")
    .select("*")
    .eq("user_id", uid)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createPet(input: PetInput) {
  const errs = validatePet(input);
  if (errs.length) throw new Error("validation_failed");
  const { data: sessionData } = await supabase.auth.getSession();
  const uid = sessionData.session?.user?.id;
  if (!uid) throw new Error("not_authenticated");
  const payload = { ...normalizePet(input), user_id: uid };
  const { error } = await supabase.from("pets").insert(payload);
  if (error) throw error;
  return { ok: true };
}

export async function updatePet(id: string, input: PetInput) {
  const errs = validatePet(input);
  if (errs.length) throw new Error("validation_failed");
  const { error } = await supabase.from("pets").update(normalizePet(input)).eq("id", id);
  if (error) throw error;
  return { ok: true };
}

export async function deletePet(id: string) {
  const { error } = await supabase.from("pets").delete().eq("id", id);
  if (error) throw error;
  return { ok: true };
}

/* --------------------------- Notifications --------------------------- */

export type NotificationType =
  | "booking_created"
  | "booking_confirmed"
  | "booking_cancelled"
  | "booking_completed"
  | "payment_pending"
  | "system";

export type NotificationRow = {
  id: string;
  user_id: string | null;
  type: string;
  title: string;
  message: string | null;
  status: "pending" | "sent" | "failed";
  read_at: string | null;
  created_at: string;
};

export async function createNotification(input: {
  user_id?: string | null;
  type: NotificationType | string;
  title: string;
  message?: string | null;
}) {
  const { error } = await supabase.from("notifications").insert({
    user_id: input.user_id ?? null,
    type: input.type,
    title: sanitize(input.title),
    message: input.message ? sanitize(input.message) : null,
    status: "sent",
  });
  if (error) throw error;
  return { ok: true };
}

export async function getMyNotifications(limit = 50): Promise<NotificationRow[]> {
  const { data: sessionData } = await supabase.auth.getSession();
  const uid = sessionData.session?.user?.id;
  if (!uid) return [];
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", uid)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as NotificationRow[];
}

export async function getAdminNotifications(limit = 50): Promise<NotificationRow[]> {
  // Operational notifications live with user_id = null and are visible to staff/admin per RLS.
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .is("user_id", null)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as NotificationRow[];
}

export async function markNotificationAsRead(id: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .is("read_at", null);
  if (error) throw error;
  return { ok: true };
}

export async function markAllNotificationsAsRead(scope: "mine" | "operational") {
  const nowIso = new Date().toISOString();
  let q = supabase.from("notifications").update({ read_at: nowIso }).is("read_at", null);
  if (scope === "mine") {
    const { data: sessionData } = await supabase.auth.getSession();
    const uid = sessionData.session?.user?.id;
    if (!uid) return { ok: true };
    q = q.eq("user_id", uid);
  } else {
    q = q.is("user_id", null);
  }
  const { error } = await q;
  if (error) throw error;
  return { ok: true };
}
