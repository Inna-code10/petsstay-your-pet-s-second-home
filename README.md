# PetSStay

Educational MVP for a pet-boarding business. Multilingual (EN / RU / EL) marketing site, booking flow, client dashboard, staff CRM, and admin dashboard, backed by Lovable Cloud (Supabase) with RLS, database-triggered transactional email via Resend, and internal notifications.

## Main Features

- Premium responsive landing page (desktop / tablet / mobile)
- EN / RU / EL language switcher with persisted UI language
- Anonymous **and** authenticated booking form with optional message / special request
- Client dashboard: My Bookings, My Pets CRUD, saved-pet booking selector, notifications bell
- Staff CRM: booking list with search, status/pet filters, details, linked pets, confirm / cancel / mark-completed actions
- Admin dashboard: overview stats, bookings, clients, pets, estimated revenue, deletion of test bookings
- Internal notification system (operational + per-user) with mark-as-read
- Transactional emails via Resend for `booking_created`, `booking_confirmed`, `booking_cancelled`, `booking_completed`, dispatched from Postgres triggers using `pg_net` — browser-independent
- Email delivery tracking with duplicate prevention and failed-delivery retry
- Per-booking `preferred_language` persistence for multilingual emails

## Technology Stack

- TanStack Start v1 (React 19, Vite 7), TypeScript strict
- Tailwind CSS v4, shadcn/ui, Radix primitives
- Lovable Cloud (Supabase): Postgres, Auth, RLS, Edge Functions, `pg_net`, `pg_cron`
- Resend (transactional email provider)
- File-based routing under `src/routes/`

## Authentication and Roles

- Email/password auth via Supabase Auth
- Roles stored in a dedicated `user_roles` table with `app_role` enum (`client`, `staff`, `admin`)
- `has_role(user_id, role)` is a `SECURITY DEFINER` function used inside RLS policies to avoid recursion
- Trigger `handle_new_user` inserts a `profiles` row and assigns the default `client` role on signup
- Only `admin` role can insert into `user_roles` (RLS). Users **cannot** self-elevate.
- Route protection via `ProtectedShell` + role-aware redirect for `/dashboard`, `/staff`, `/admin`

## Client Functionality (`/dashboard`)

- My Bookings list with status
- My Pets: create / edit / delete, medical/behavior notes, vaccination status, photo URL
- Saved-pet quick-select in booking form
- Booking calendar / upcoming dates
- Personal notifications with unread count

## Staff Functionality (`/staff`)

- List all bookings, search by name/email/phone, filter by status and pet type
- Booking detail drawer with linked pets (for authenticated bookings)
- Actions: **Confirm**, **Cancel**, **Mark completed** — each triggers a status-change email
- Operational notification feed

## Admin Functionality (`/admin`)

- Overview: totals, per-status counts, clients, pets, estimated revenue
- Full bookings, clients, and pets tables
- Delete test bookings
- Operational notification feed

## Database and Supabase

Public schema tables: `bookings`, `pets`, `profiles`, `user_roles`, `contacts`, `notifications`, `email_deliveries`.

Key triggers / functions:
- `notify_on_booking` — writes internal notifications on booking insert/status-change
- `dispatch_booking_email` — after insert & after status update, posts to the `send-booking-email` Edge Function via `pg_net.http_post`
- `handle_new_user` — provisions profile + default `client` role on signup

## RLS Security

- RLS enabled on all sensitive tables
- `bookings`: anonymous INSERT allowed (no SELECT for anon); authenticated users SELECT/UPDATE their own; staff/admin SELECT/UPDATE all
- `pets`: users manage their own; staff/admin SELECT all
- `profiles`: users read/update their own; staff/admin SELECT all
- `user_roles`: users read their own roles; only admins INSERT/UPDATE/DELETE
- `notifications`: users read their own; staff/admin read operational (null-user) rows
- `email_deliveries`: service-role only

## Notifications

Two audiences from one table:
- **Personal** — `user_id = auth.uid()` rows
- **Operational** — `user_id IS NULL` rows visible to staff/admin

The bell component polls, shows unread count, supports mark-as-read and mark-all-as-read.

## Email Architecture

1. Booking insert or status change fires the `dispatch_booking_email` trigger.
2. Trigger calls `pg_net.http_post` → Supabase Edge Function `send-booking-email`.
3. Edge Function (service role, server-only):
   - Validates payload (UUID, allowed event, size limit, POST-only)
   - Loads the authoritative booking row and derives recipient + language server-side
   - Enforces event authorization: status-change events only send when `bookings.status` already matches
   - Reserves an `email_deliveries` row atomically (unique index on `booking_id + event_type + recipient`) to prevent duplicates
   - Renders EN / RU / EL template with full HTML escaping of user content
   - Sends via Resend; records `sent` / `failed`
4. Failed rows can be retried on subsequent invocations; `sent` rows are never re-sent.
5. Frontend never calls the email function directly — email failures cannot break booking writes.

## Supported Languages

- English (`en`), Russian (`ru`), Greek (`el`)
- Language switcher in header
- `bookings.preferred_language` stores the language the customer used when booking, so status emails match

## Local Development

```bash
bun install
bun run dev        # Vite dev server
bun run build      # production build
bunx tsgo --noEmit # typecheck
```

## Required Environment Variables (no secret values here)

Client (public, in `.env`):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

Server-only (Edge Function / server runtime):
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_PUBLISHABLE_KEY`
- `RESEND_API_KEY`
- `PETSSTAY_FROM_EMAIL` (must be an address on a Resend-verified domain)
- `PETSSTAY_ADMIN_EMAIL` (BCC / ops notifications)

Never commit real secret values. Do not expose the service-role or Resend key to the client bundle.

## Production Configuration Requirements

To send real transactional emails in production:
1. Own a domain and verify it in Resend (SPF / DKIM records).
2. Set `PETSSTAY_FROM_EMAIL` to an address on that verified domain (e.g. `bookings@yourdomain.com`).
3. Keep `RESEND_API_KEY` server-only.
4. Without a verified domain, Resend will only deliver to the account owner's own email — production sending will fail for other recipients.

## Creating Staff / Admin Test Accounts

There is no self-service Staff/Admin registration by design. To provision test roles:

1. Register a new user through `/register` (this becomes a normal `client` account with a profile).
2. Repeat for a second account intended to become Admin.
3. In the Lovable Cloud backend, open the SQL editor and run:
   ```sql
   -- Find the user's UUID
   select id, email from auth.users where email = 'staff@example.com';

   -- Assign the staff role
   insert into public.user_roles (user_id, role)
   values ('<uuid-from-above>', 'staff')
   on conflict do nothing;

   -- Assign the admin role for the other account
   insert into public.user_roles (user_id, role)
   values ('<uuid-of-admin-account>', 'admin')
   on conflict do nothing;
   ```
4. Sign out and sign back in with each account. `/staff` and `/admin` now become accessible respectively.

## Current Status

**Educational MVP — feature-complete.** All core flows (anonymous & authenticated bookings, client dashboard, staff CRM, admin dashboard, internal notifications, database-triggered emails, multilingual support, RLS) are implemented and typecheck cleanly. Payments (Stripe), WhatsApp automation, and push notifications are intentionally out of scope.
