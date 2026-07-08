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

export async function createBooking(input: BookingInput) {
  const errs = validateBooking(input);
  if (errs.length) throw new Error("validation_failed");

  // Attach user_id when a session is available (anonymous bookings are still allowed).
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id ?? null;

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
  };

  const { error } = await supabase.from("bookings").insert(payload);
  if (error) throw error;
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

export async function getBookings() {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
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
