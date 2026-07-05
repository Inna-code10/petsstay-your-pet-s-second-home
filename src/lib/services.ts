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
  };

  const { data, error } = await supabase
    .from("bookings")
    .insert(payload)
    .select("id")
    .single();
  if (error) throw error;
  return data;
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

  const { data, error } = await supabase
    .from("contacts")
    .insert(payload)
    .select("id")
    .single();
  if (error) throw error;
  return data;
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
