import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, LayoutDashboard, UserPlus, LogIn } from "lucide-react";
import {
  Menu,
  X,
  Star,
  ShieldCheck,
  Camera,
  Heart,
  Clock,
  Sparkles,
  PawPrint,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Instagram,
  Facebook,
  ArrowRight,
  Check,
  ChevronDown,
  Pill,
  Utensils,
  Stethoscope,
  Users,
  Home as HomeIcon,
  Sun,
  Moon,
  Award,
  BadgeCheck,
  CalendarCheck,
  Handshake,
  DoorOpen,
  Plane,
  Quote,
  Globe,
} from "lucide-react";

import { useI18n, type Lang } from "@/lib/i18n";
import { DateField } from "@/components/DateField";
import {
  heroImage as hero,
  galleryImages,
  teamPhotos,
  reviewAvatars,
  locationImage as location,
} from "@/lib/images";
const team1 = teamPhotos.member1;
const team2 = teamPhotos.member2;
const team3 = teamPhotos.member3;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { property: "og:image", content: "https://petsstay.lovable.app/og.jpg" },
      { name: "twitter:image", content: "https://petsstay.lovable.app/og.jpg" },
    ],
  }),
  component: Landing,
});

const WHATSAPP = "https://wa.me/35799000000";
const PHONE_DISPLAY = "+357 99 000 000";

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Header />
      <main>
        <Hero />
        <TrustBar />
        <Services />
        <WhyUs />
        <Calculator />
        <HowItWorks />
        <Team />
        <Stats />
        <Gallery />
        <Testimonials />
        <Faq />
        <Location />
        <FinalCta />
      </main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}

/* ------------------------------ HEADER ------------------------------ */

const NAV = [
  { key: "nav_home", href: "#top" },
  { key: "nav_services", href: "#services" },
  { key: "nav_pricing", href: "#pricing" },
  { key: "nav_reviews", href: "#reviews" },
  { key: "nav_faq", href: "#faq" },
  { key: "nav_contact", href: "#contact" },
] as const;

function Header() {
  const { t, lang, setLang } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      id="top"
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/85 backdrop-blur-xl border-b border-border shadow-[0_4px_20px_-12px_rgba(31,41,55,0.15)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 md:h-20 items-center justify-between gap-4">
          <a href="#top" className="flex items-center gap-2 group">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl text-primary-foreground shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-sun)" }}>
              <PawPrint className="h-5 w-5" />
            </span>
            <span className="text-lg md:text-xl font-extrabold tracking-tight">
              Pet<span className="text-gradient">S</span>Stay
            </span>
          </a>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map((n) => (
              <a
                key={n.key}
                href={n.href}
                className="px-3.5 py-2 text-sm font-medium text-foreground/80 rounded-full hover:text-foreground hover:bg-cream transition-colors"
              >
                {t(n.key)}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <LangSwitcher lang={lang} setLang={setLang} />
            <AuthNav />
            <button
              onClick={() => setOpen((o) => !o)}
              className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white"
              aria-label="Menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden pb-4 animate-fade-up">
            <div className="rounded-3xl bg-white shadow-[var(--shadow-card)] border border-border p-2">
              {NAV.map((n) => (
                <a
                  key={n.key}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 rounded-2xl text-base font-medium hover:bg-cream"
                >
                  {t(n.key)}
                </a>
              ))}
              <MobileAuthNav onNavigate={() => setOpen(false)} />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function AuthNav() {
  const { user, role, fullName, signOut, loading } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  if (loading) return null;
  if (!user) {
    return (
      <>
        <Link
          to="/login"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-2 text-sm font-semibold hover:bg-cream"
        >
          <LogIn className="h-4 w-4" /> {t("auth_login_btn")}
        </Link>
        <a
          href="#book"
          className="hidden sm:inline-flex btn-hero items-center gap-2 rounded-full px-4 md:px-5 py-2.5 text-sm font-semibold"
        >
          {t("cta_book")} <ArrowRight className="h-4 w-4" />
        </a>
      </>
    );
  }
  const dashTo = role === "admin" ? "/admin" : role === "staff" ? "/staff" : "/dashboard";
  return (
    <>
      {fullName && (
        <span className="hidden md:inline text-sm font-medium text-foreground/70 mr-1">
          {fullName.split(" ")[0]}
        </span>
      )}
      <Link
        to={dashTo}
        className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-3.5 py-2 text-sm font-semibold"
      >
        <LayoutDashboard className="h-4 w-4" /> {t("auth_dashboard")}
      </Link>
      <button
        onClick={async () => {
          await signOut();
          navigate({ to: "/" });
        }}
        className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-2 text-sm font-semibold hover:bg-cream"
      >
        <LogOut className="h-4 w-4" /> {t("auth_logout")}
      </button>
    </>
  );
}

function MobileAuthNav({ onNavigate }: { onNavigate: () => void }) {
  const { user, role, signOut } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  if (!user) {
    return (
      <>
        <Link
          to="/login"
          onClick={onNavigate}
          className="mt-2 flex items-center justify-center gap-2 rounded-2xl border border-border bg-white px-4 py-3 text-base font-semibold"
        >
          <LogIn className="h-4 w-4" /> {t("auth_login_btn")}
        </Link>
        <Link
          to="/register"
          onClick={onNavigate}
          className="mt-2 flex items-center justify-center gap-2 rounded-2xl border border-border bg-white px-4 py-3 text-base font-semibold"
        >
          <UserPlus className="h-4 w-4" /> {t("auth_register_btn")}
        </Link>
        <a
          href="#book"
          onClick={onNavigate}
          className="mt-2 btn-hero flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-base font-semibold"
        >
          {t("cta_book")} <ArrowRight className="h-4 w-4" />
        </a>
      </>
    );
  }
  const dashTo = role === "admin" ? "/admin" : role === "staff" ? "/staff" : "/dashboard";
  return (
    <>
      <Link
        to={dashTo}
        onClick={onNavigate}
        className="mt-2 flex items-center justify-center gap-2 rounded-2xl bg-foreground text-background px-4 py-3 text-base font-semibold"
      >
        <LayoutDashboard className="h-4 w-4" /> {t("auth_dashboard")}
      </Link>
      <button
        onClick={async () => {
          await signOut();
          onNavigate();
          navigate({ to: "/" });
        }}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-white px-4 py-3 text-base font-semibold"
      >
        <LogOut className="h-4 w-4" /> {t("auth_logout")}
      </button>
    </>
  );
}

function LangSwitcher({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const langs: { code: Lang; label: string }[] = [
    { code: "en", label: "EN" },
    { code: "ru", label: "RU" },
    { code: "el", label: "EL" },
  ];
  return (
    <div className="inline-flex items-center rounded-full border border-border bg-white/80 backdrop-blur p-1 text-xs font-semibold">
      <Globe className="h-3.5 w-3.5 ml-2 mr-1 text-muted-foreground" />
      {langs.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={`px-2.5 py-1 rounded-full transition-colors ${
            lang === l.code ? "bg-foreground text-background" : "text-foreground/70 hover:text-foreground"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------ HERO ------------------------------ */

function Hero() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden pt-28 md:pt-36 pb-16 md:pb-24 bg-warm">
      {/* decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl animate-blob" />
      <div className="pointer-events-none absolute top-40 -right-24 h-96 w-96 rounded-full bg-accent/15 blur-3xl animate-blob" style={{ animationDelay: "-6s" }} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          <div className="lg:col-span-7 animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 text-xs font-semibold text-foreground/80">
              <Sun className="h-3.5 w-3.5 text-primary" /> {t("hero_eyebrow")}
            </div>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.05] tracking-tight">
              {t("hero_title_1")} <br className="hidden sm:block" />
              <span className="text-gradient">{t("hero_title_2")}</span> <br className="hidden sm:block" />
              {t("hero_title_3")}
            </h1>
            <p className="mt-5 md:mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl">
              {t("hero_sub")}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a href="#book" className="btn-hero inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-base font-semibold">
                {t("cta_book_stay")} <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#pricing"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-white/70 backdrop-blur px-6 py-3.5 text-base font-semibold hover:bg-white transition-colors"
              >
                {t("cta_view_prices")}
              </a>
            </div>

            <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-foreground/80">
              {[
                ["badge_team", ShieldCheck],
                ["badge_care", Clock],
                ["badge_photos", Camera],
                ["badge_safe", HomeIcon],
                ["badge_lovers", Heart],
              ].map(([k, Icon]) => {
                const I = Icon as typeof ShieldCheck;
                return (
                  <li key={k as string} className="inline-flex items-center gap-1.5">
                    <I className="h-4 w-4 text-accent" strokeWidth={2.5} />
                    <span className="font-medium">{t(k as never)}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="lg:col-span-5 relative animate-fade-up" style={{ animationDelay: "150ms" }}>
            <div className="relative">
              <div className="absolute -inset-6 rounded-[36px] bg-gradient-to-br from-primary/25 via-primary/10 to-transparent blur-2xl" />
              <div className="relative overflow-hidden rounded-[32px] shadow-[var(--shadow-float)] ring-1 ring-black/5">
                <img
                  src={hero}
                  alt="Happy dog and cat with professional pet sitter"
                  width={1280}
                  height={1280}
                  className="w-full h-[440px] md:h-[560px] object-cover"
                />
              </div>

              {/* Floating cards */}
              <div className="absolute -left-3 top-6 md:top-10 glass rounded-2xl shadow-[var(--shadow-card)] px-4 py-3 flex items-center gap-3 animate-float">
                <div className="flex items-center gap-0.5 text-primary">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <div className="text-sm">
                  <div className="font-bold">4.9 {t("hero_rating_label")}</div>
                  <div className="text-muted-foreground text-xs">{t("hero_reviews_from")}</div>
                </div>
              </div>

              <div className="absolute -right-3 top-1/3 glass rounded-2xl shadow-[var(--shadow-card)] px-4 py-3 animate-float" style={{ animationDelay: "-2s" }}>
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-primary fill-primary" />
                  <div>
                    <div className="text-sm font-bold">523+ {t("hero_happy_pets")}</div>
                    <div className="text-[11px] text-muted-foreground">{t("hero_and_counting")}</div>
                  </div>
                </div>
              </div>

              <div className="absolute -left-3 bottom-6 glass rounded-2xl shadow-[var(--shadow-card)] px-4 py-3 animate-float" style={{ animationDelay: "-4s" }}>
                <div className="flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4 text-accent" />
                  <div className="text-sm font-bold">1,240+ {t("hero_bookings_label")}</div>
                </div>
              </div>

              <div className="absolute -right-3 bottom-10 glass rounded-2xl shadow-[var(--shadow-card)] px-4 py-3 animate-float" style={{ animationDelay: "-1s" }}>
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4 text-primary" />
                  <div className="text-sm font-bold">{t("hero_247")}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking form */}
        <BookingForm />
      </div>
    </section>
  );
}

/* --------------------------- BOOKING FORM --------------------------- */

function BookingForm() {
  const { t, lang } = useI18n();
  const { user, fullName } = useAuth();
  const [pet, setPet] = useState<"dog" | "cat">("dog");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [arrival, setArrival] = useState("");
  const [departure, setDeparture] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [myPets, setMyPets] = useState<Array<{ id: string; pet_name: string; pet_type: string }>>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>("");
  const prefilledRef = useRef(false);

  const todayIso = new Date().toISOString().slice(0, 10);

  // Prefill from authenticated user's profile (fields remain editable)
  useEffect(() => {
    if (!user || prefilledRef.current) return;
    let cancelled = false;
    (async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data } = await supabase
        .from("profiles")
        .select("full_name, phone, email")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      const nm = data?.full_name || fullName || "";
      const ph = data?.phone || "";
      const em = data?.email || user.email || "";
      setName((v) => v || nm);
      setPhone((v) => v || ph);
      setEmail((v) => v || em);
      prefilledRef.current = true;
    })();
    return () => { cancelled = true; };
  }, [user, fullName]);

  // Load saved pets for logged-in users
  useEffect(() => {
    if (!user) { setMyPets([]); return; }
    let cancelled = false;
    (async () => {
      try {
        const { getMyPets } = await import("@/lib/services");
        const rows = await getMyPets();
        if (!cancelled) setMyPets(rows as Array<{ id: string; pet_name: string; pet_type: string }>);
      } catch (err) { console.error("[BookingForm pets]", err); }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const nights = useMemo(() => {
    if (!arrival || !departure || arrival > departure) return 0;
    const a = new Date(arrival + "T00:00:00");
    const d = new Date(departure + "T00:00:00");
    return Math.max(0, Math.round((d.getTime() - a.getTime()) / 86400000));
  }, [arrival, departure]);

  function onSelectSavedPet(id: string) {
    setSelectedPetId(id);
    if (!id) return;
    const p = myPets.find((x) => x.id === id);
    if (p && (p.pet_type === "dog" || p.pet_type === "cat")) setPet(p.pet_type);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    if (!name.trim() || !phone.trim() || !email.trim() || !arrival || !departure) {
      setStatus("error"); setErrorMsg(t("book_err_required")); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatus("error"); setErrorMsg(t("book_err_email")); return;
    }
    if (!/^[+\d][\d\s\-()]{5,}$/.test(phone.trim())) {
      setStatus("error"); setErrorMsg(t("book_err_phone")); return;
    }
    if (arrival < todayIso) {
      setStatus("error"); setErrorMsg(t("book_err_past")); return;
    }
    if (arrival > departure) {
      setStatus("error"); setErrorMsg(t("book_err_dates")); return;
    }
    setStatus("submitting");
    try {
      const { createBooking } = await import("@/lib/services");
      await createBooking({
        owner_name: name, phone, email, pet_type: pet,
        arrival_date: arrival, departure_date: departure,
        message: message.trim() ? message.trim() : null,
      }, lang);
      setStatus("success");
      setName(""); setPhone(""); setEmail(""); setArrival(""); setDeparture(""); setMessage(""); setSelectedPetId("");
      setTimeout(() => setStatus("idle"), 4000);
    } catch (err) {
      console.error("[BookingForm]", err);
      setStatus("error");
      setErrorMsg(t("book_error"));
    }
  }

  const busy = status === "submitting";

  return (
    <div id="book" className="relative mt-12 md:mt-16">
      <form
        onSubmit={onSubmit}
        className="glass rounded-[28px] p-4 sm:p-6 md:p-7 shadow-[var(--shadow-card)] border border-white/60 grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-end"
      >
        <div className="md:col-span-12 lg:col-span-3 flex items-center gap-3">
          <div className="hidden lg:flex h-11 w-11 items-center justify-center rounded-2xl text-primary-foreground shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-sun)" }}>
            <CalendarCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-base font-bold">{t("book_title")}</div>
            <div className="text-xs text-muted-foreground">{t("book_sub")}</div>
          </div>
        </div>

        <Field label={t("book_name")} className="md:col-span-6 lg:col-span-2">
          <input required placeholder={t("book_name_ph")} className="input-base" value={name} onChange={(e) => setName(e.target.value)} disabled={busy} />
        </Field>
        <Field label={t("book_phone")} className="md:col-span-6 lg:col-span-2">
          <input required type="tel" placeholder={t("book_phone_ph")} className="input-base" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={busy} />
        </Field>
        <Field label={t("book_email")} className="md:col-span-6 lg:col-span-2">
          <input required type="email" placeholder={t("book_email_ph")} className="input-base" value={email} onChange={(e) => setEmail(e.target.value)} disabled={busy} />
        </Field>
        <Field label={t("book_pet")} className="md:col-span-6 lg:col-span-1">
          <div className="flex rounded-full bg-cream p-1 h-[46px]">
            {(["dog", "cat"] as const).map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => setPet(p)}
                className={`flex-1 rounded-full text-xs font-bold transition-all ${
                  pet === p ? "bg-white text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                {p === "dog" ? t("book_dog") : t("book_cat")}
              </button>
            ))}
          </div>
        </Field>
        <Field label={t("book_arrival")} className="md:col-span-6 lg:col-span-1">
          <DateField
            required
            value={arrival}
            onChange={(v) => {
              setArrival(v);
              if (departure && v && departure < v) setDeparture("");
            }}
            min={new Date().toISOString().slice(0, 10)}
            disabled={busy}
            ariaLabel={t("book_arrival")}
          />
        </Field>
        <Field label={t("book_departure")} className="md:col-span-6 lg:col-span-1">
          <DateField
            required
            value={departure}
            onChange={setDeparture}
            min={arrival || new Date().toISOString().slice(0, 10)}
            disabled={busy}
            ariaLabel={t("book_departure")}
          />
        </Field>

        {user && (
          <div className="md:col-span-12">
            {myPets.length > 0 ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider shrink-0">
                  {t("book_select_pet")}
                </label>
                <select
                  className="input-base sm:max-w-xs"
                  value={selectedPetId}
                  onChange={(e) => onSelectSavedPet(e.target.value)}
                  disabled={busy}
                >
                  <option value="">{t("book_select_pet_none")}</option>
                  {myPets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.pet_name} · {p.pet_type === "dog" ? t("book_dog") : p.pet_type === "cat" ? t("book_cat") : p.pet_type}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                <span>{t("book_no_pets_hint")}</span>
                <Link to="/dashboard" className="font-semibold text-accent hover:underline">
                  {t("book_add_pet_profile")} →
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="md:col-span-12">
          <label className="mb-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <span>{t("book_message")}</span>
            <span className="normal-case tracking-normal font-medium text-[10px] text-muted-foreground/70">({t("book_optional")})</span>
          </label>
          <textarea
            rows={3}
            className="input-base"
            style={{ height: "auto", borderRadius: 18, paddingTop: 12, paddingBottom: 12, minHeight: 90, resize: "vertical" }}
            placeholder={t("book_message_ph")}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={busy}
            maxLength={1000}
          />
        </div>

        <div className="md:col-span-12 lg:col-span-12 flex flex-col sm:flex-row sm:items-center gap-3">
          <button type="submit" disabled={busy} className="btn-hero inline-flex items-center justify-center gap-2 rounded-full h-[46px] px-5 text-sm font-bold disabled:opacity-70 w-full sm:w-auto">
            {busy ? (
              <><span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />{t("book_submitting")}</>
            ) : status === "success" ? (
              <><Check className="h-5 w-5" />{t("book_success")}</>
            ) : (
              <>{t("book_submit")}</>
            )}
          </button>
          {nights > 0 && (
            <div className="text-sm font-semibold text-muted-foreground">
              {t("book_stay_duration")}: <span className="text-foreground">{nights} {nights === 1 ? t("book_nights_one") : t("book_nights_many")}</span>
            </div>
          )}
          <div aria-live="polite" className="text-sm font-semibold">
            {status === "success" && <span className="text-accent">{t("book_success")}</span>}
            {status === "error" && <span className="text-destructive">{errorMsg}</span>}
          </div>
        </div>
      </form>
      <style>{`
        .input-base {
          height: 46px;
          width: 100%;
          border-radius: 9999px;
          background: white;
          border: 1px solid var(--border);
          padding: 0 16px;
          font-size: 14px;
          font-weight: 500;
          color: var(--foreground);
          outline: none;
          transition: border-color .2s, box-shadow .2s;
        }
        .input-base:focus { border-color: var(--primary); box-shadow: 0 0 0 4px color-mix(in oklab, var(--primary) 20%, transparent); }
        .input-base:disabled { opacity: .7; cursor: not-allowed; }
      `}</style>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

/* ------------------------------ TRUST BAR ------------------------------ */

function TrustBar() {
  const { t } = useI18n();
  const items = [
    { icon: Star, label: t("trust_rated") },
    { icon: Heart, label: `523+ ${t("trust_pets")}` },
    { icon: CalendarCheck, label: `1,240+ ${t("trust_bookings")}` },
    { icon: Award, label: `5+ ${t("trust_years")}` },
    { icon: Users, label: t("trust_team") },
    { icon: BadgeCheck, label: t("trust_insured") },
    { icon: HomeIcon, label: t("trust_families") },
  ];
  return (
    <section className="py-10 md:py-14 bg-white border-y border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {items.map(({ icon: Icon, label }) => (
            <div key={label} className="inline-flex items-center gap-2 text-sm md:text-[15px] font-semibold text-foreground/80">
              <Icon className="h-4 w-4 text-primary" strokeWidth={2.5} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ SERVICES ------------------------------ */

function Services() {
  const { t } = useI18n();
  const items = [
    { icon: Clock, k: "s_boarding" },
    { icon: PawPrint, k: "s_walks" },
    { icon: Utensils, k: "s_feeding" },
    { icon: Pill, k: "s_meds" },
    { icon: Camera, k: "s_updates" },
    { icon: Sparkles, k: "s_play" },
    { icon: Moon, k: "s_sleep" },
    { icon: Heart, k: "s_individual" },
    { icon: Stethoscope, k: "s_emergency" },
  ] as const;

  return (
    <section id="services" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead eyebrow={t("services_eyebrow")} title={t("services_title")} sub={t("services_sub")} />
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {items.map(({ icon: Icon, k }, i) => (
            <div
              key={k}
              className="card-lift group rounded-3xl bg-white border border-border p-6 md:p-7 shadow-[var(--shadow-soft)] relative overflow-hidden"
              style={{ animation: `fade-up .7s ease-out ${i * 60}ms both` }}
            >
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors" />
              <div className="relative">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl text-primary-foreground shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-sun)" }}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-xl font-bold">{t(k)}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{t((k + "_d") as never)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionHead({ eyebrow, title, sub, align = "center" }: { eyebrow: string; title: string; sub?: string; align?: "center" | "left" }) {
  return (
    <div className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      <div className="inline-flex items-center gap-2 rounded-full bg-cream border border-border px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
        <Sparkles className="h-3.5 w-3.5" /> {eyebrow}
      </div>
      <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">{title}</h2>
      {sub && <p className="mt-4 text-lg text-muted-foreground">{sub}</p>}
    </div>
  );
}

/* ------------------------------ WHY US ------------------------------ */

function WhyUs() {
  const { t } = useI18n();
  const items = ["w_1", "w_2", "w_3", "w_4", "w_5", "w_6", "w_7", "w_8"] as const;
  const icons = [Users, ShieldCheck, MessageCircle, Clock, Stethoscope, BadgeCheck, Heart, Award];
  return (
    <section className="py-20 md:py-28 bg-cream">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead eyebrow={t("why_eyebrow")} title={t("why_title")} />
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((k, i) => {
            const Icon = icons[i];
            return (
              <div key={k} className="card-lift rounded-3xl bg-white border border-border p-6 shadow-[var(--shadow-soft)]">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-4 text-[15px] font-semibold leading-snug">{t(k)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ CALCULATOR ------------------------------ */

function Calculator() {
  const { t } = useI18n();
  const [pet, setPet] = useState<"dog" | "cat">("dog");
  const [count, setCount] = useState(1);
  const [days, setDays] = useState(5);
  const [meds, setMeds] = useState(false);
  const [walk, setWalk] = useState(false);
  const [food, setFood] = useState(false);

  const base = pet === "dog" ? 28 : 22;
  const extras = (meds ? 5 : 0) + (walk ? 6 : 0) + (food ? 4 : 0);
  const perDay = base + extras;
  const total = perDay * days * count;

  return (
    <section id="pricing" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead eyebrow={t("calc_eyebrow")} title={t("calc_title")} sub={t("calc_sub")} />
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 rounded-[28px] bg-white border border-border shadow-[var(--shadow-card)] p-6 md:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("calc_pet")}</div>
                <div className="mt-2 flex rounded-full bg-cream p-1">
                  {(["dog", "cat"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPet(p)}
                      className={`flex-1 rounded-full py-2.5 text-sm font-bold transition-all ${
                        pet === p ? "bg-white shadow-sm" : "text-muted-foreground"
                      }`}
                    >
                      {p === "dog" ? "🐶 " + t("book_dog") : "🐱 " + t("book_cat")}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("calc_count")}</div>
                <Stepper value={count} onChange={setCount} min={1} max={5} />
              </div>
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("calc_days")}</div>
                  <div className="text-sm font-bold">{days} {days === 1 ? t("calc_night") : t("calc_nights")}</div>
                </div>
                <input
                  type="range"
                  min={1}
                  max={30}
                  value={days}
                  onChange={(e) => setDays(parseInt(e.target.value))}
                  className="mt-3 w-full accent-primary"
                />
              </div>
              <div className="sm:col-span-2">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{t("calc_extras")}</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Toggle icon={Pill} label={t("calc_meds")} price="+€5" active={meds} onToggle={() => setMeds((v) => !v)} />
                  <Toggle icon={PawPrint} label={t("calc_walk")} price="+€6" active={walk} onToggle={() => setWalk((v) => !v)} />
                  <Toggle icon={Utensils} label={t("calc_food")} price="+€4" active={food} onToggle={() => setFood((v) => !v)} />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative rounded-[28px] p-8 text-primary-foreground shadow-[var(--shadow-float)] overflow-hidden" style={{ background: "var(--gradient-sun)" }}>
              <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-2xl" />
              <div className="relative">
                <div className="text-xs font-bold uppercase tracking-wider text-white/80">{t("calc_total")}</div>
                <div className="mt-2 flex items-baseline gap-2">
                  <div className="text-6xl md:text-7xl font-extrabold tracking-tight">€{total}</div>
                </div>
                <div className="mt-1 text-white/85 text-sm font-semibold">€{perDay}{t("calc_per_day")} · {days} × {count} {count > 1 ? t("calc_pet_many") : t("calc_pet_one")}</div>

                <div className="mt-6 space-y-2 text-sm">
                  <Row label={pet === "dog" ? t("book_dog") : t("book_cat")} value={`€${base}${t("calc_per_day")}`} />
                  {meds && <Row label={t("calc_meds")} value={`+€5${t("calc_per_day")}`} />}
                  {walk && <Row label={t("calc_walk")} value={`+€6${t("calc_per_day")}`} />}
                  {food && <Row label={t("calc_food")} value={`+€4${t("calc_per_day")}`} />}
                </div>

                <a href="#book" className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white text-primary px-5 py-3.5 text-sm font-bold hover:scale-[1.02] transition-transform">
                  {t("calc_book")} <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-t border-white/20 pt-2">
      <span className="text-white/85">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function Stepper({ value, onChange, min, max }: { value: number; onChange: (v: number) => void; min: number; max: number }) {
  return (
    <div className="mt-2 flex items-center rounded-full bg-cream p-1 h-[46px]">
      <button onClick={() => onChange(Math.max(min, value - 1))} className="h-9 w-9 rounded-full bg-white shadow-sm font-bold">−</button>
      <div className="flex-1 text-center font-bold">{value}</div>
      <button onClick={() => onChange(Math.min(max, value + 1))} className="h-9 w-9 rounded-full bg-white shadow-sm font-bold">+</button>
    </div>
  );
}

function Toggle({ icon: Icon, label, price, active, onToggle }: { icon: typeof Pill; label: string; price: string; active: boolean; onToggle: () => void }) {
  const { t } = useI18n();
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`text-left rounded-2xl border p-3.5 transition-all ${
        active ? "border-primary bg-primary/5 shadow-[var(--shadow-soft)]" : "border-border bg-white hover:border-primary/30"
      }`}
    >
      <div className="flex items-center gap-2">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${active ? "bg-primary text-primary-foreground" : "bg-cream text-primary"}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold leading-tight">{label}</div>
          <div className="text-xs text-muted-foreground">{price}{t("calc_per_day")}</div>
        </div>
        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${active ? "border-primary bg-primary" : "border-border"}`}>
          {active && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
        </div>
      </div>
    </button>
  );
}

/* ------------------------------ HOW IT WORKS ------------------------------ */

function HowItWorks() {
  const { t } = useI18n();
  const steps = [
    { icon: CalendarCheck, k: "step_1" },
    { icon: Handshake, k: "step_2" },
    { icon: DoorOpen, k: "step_3" },
    { icon: Plane, k: "step_4" },
  ] as const;
  return (
    <section className="py-20 md:py-28 bg-cream relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-warm opacity-40" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead eyebrow={t("how_eyebrow")} title={t("how_title")} />
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map(({ icon: Icon, k }, i) => (
            <div key={k} className="relative">
              <div className="card-lift rounded-3xl bg-white border border-border p-6 shadow-[var(--shadow-soft)] h-full">
                <div className="flex items-start justify-between">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl text-primary-foreground shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-sun)" }}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-5xl font-black text-primary/10 leading-none">0{i + 1}</div>
                </div>
                <h3 className="mt-4 text-lg font-bold">{t(k)}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t((k + "_d") as never)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ TEAM ------------------------------ */

function Team() {
  const { t } = useI18n();
  const members = [
    { img: team1, name: t("team1_name"), role: t("team1_role"), years: "8", bio: t("team1_bio") },
    { img: team2, name: t("team2_name"), role: t("team2_role"), years: "6", bio: t("team2_bio") },
    { img: team3, name: t("team3_name"), role: t("team3_role"), years: "5", bio: t("team3_bio") },
  ];
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead eyebrow={t("team_eyebrow")} title={t("team_title")} sub={t("team_sub")} />
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {members.map((m) => (
            <div key={m.name} className="card-lift rounded-[28px] overflow-hidden bg-white border border-border shadow-[var(--shadow-soft)]">
              <div className="relative">
                <img src={m.img} alt={m.name} loading="lazy" width={600} height={700} className="w-full h-80 object-cover" />
                <div className="absolute top-4 left-4 glass rounded-full px-3 py-1 text-xs font-bold">
                  {m.years}+ {t("team_years_exp")}
                </div>
              </div>
              <div className="p-6">
                <div className="text-xl font-bold">{m.name}</div>
                <div className="text-primary text-sm font-semibold">{m.role}</div>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{m.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ STATS ------------------------------ */

function useCountUp(target: number, duration = 1600) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (t: number) => {
            const p = Math.min(1, (t - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setValue(Math.round(target * eased));
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);
  return { ref, value };
}

function StatItem({ target, suffix, label, decimal }: { target: number; suffix?: string; label: string; decimal?: boolean }) {
  const { ref, value } = useCountUp(target);
  const display = decimal ? (value / 10).toFixed(1) : value.toLocaleString();
  return (
    <div ref={ref} className="text-center">
      <div className="text-5xl md:text-6xl font-extrabold text-gradient tracking-tight">
        {display}{suffix}
      </div>
      <div className="mt-2 text-sm md:text-base font-semibold text-foreground/70">{label}</div>
    </div>
  );
}

function Stats() {
  const { t } = useI18n();
  return (
    <section className="py-16 md:py-20 bg-white border-y border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
        <StatItem target={523} suffix="+" label={t("stats_pets")} />
        <StatItem target={49} decimal suffix="★" label={t("stats_rating")} />
        <StatItem target={1240} suffix="+" label={t("stats_bookings")} />
        <StatItem target={5} suffix="+" label={t("stats_years")} />
      </div>
    </section>
  );
}

/* ------------------------------ GALLERY ------------------------------ */

function Gallery() {
  const { t } = useI18n();
  const imgs = galleryImages;
  return (
    <section className="py-20 md:py-28 bg-cream">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead eyebrow={t("gallery_eyebrow")} title={t("gallery_title")} />
        <div className="mt-12 columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
          {imgs.map((im, i) => (
            <div key={i} className="relative mb-4 break-inside-avoid overflow-hidden rounded-3xl group">
              <img
                src={im.src}
                alt={im.alt}
                loading="lazy"
                className="block h-auto w-full transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ TESTIMONIALS ------------------------------ */

const REVIEW_PHOTOS = reviewAvatars;

function Testimonials() {
  const { t } = useI18n();
  const REVIEWS = useMemo(
    () => [
      { name: t("r1_name"), pet: t("r1_pet"), photo: REVIEW_PHOTOS[0], text: t("r1_text") },
      { name: t("r2_name"), pet: t("r2_pet"), photo: REVIEW_PHOTOS[1], text: t("r2_text") },
      { name: t("r3_name"), pet: t("r3_pet"), photo: REVIEW_PHOTOS[2], text: t("r3_text") },
      { name: t("r4_name"), pet: t("r4_pet"), photo: REVIEW_PHOTOS[3], text: t("r4_text") },
      { name: t("r5_name"), pet: t("r5_pet"), photo: REVIEW_PHOTOS[4], text: t("r5_text") },
      { name: t("r6_name"), pet: t("r6_pet"), photo: REVIEW_PHOTOS[5], text: t("r6_text") },
    ],
    [t],
  );
  const [idx, setIdx] = useState(0);
  const visible = useMemo(() => {
    return [REVIEWS[idx], REVIEWS[(idx + 1) % REVIEWS.length], REVIEWS[(idx + 2) % REVIEWS.length]];
  }, [idx, REVIEWS]);

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % REVIEWS.length), 5500);
    return () => clearInterval(id);
  }, [REVIEWS.length]);


  return (
    <section id="reviews" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead eyebrow={t("test_eyebrow")} title={t("test_title")} />
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {visible.map((r, i) => (
            <article
              key={r.name + i}
              className="relative rounded-[28px] bg-white border border-border p-7 shadow-[var(--shadow-soft)] card-lift animate-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <Quote className="absolute -top-3 -left-3 h-8 w-8 text-primary bg-white rounded-full p-1.5 shadow-[var(--shadow-soft)]" />
              <div className="flex items-center gap-0.5 text-primary">
                {[0, 1, 2, 3, 4].map((s) => (
                  <Star key={s} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-4 text-[15px] leading-relaxed text-foreground/85">"{r.text}"</p>
              <div className="mt-6 flex items-center gap-3 pt-5 border-t border-border">
                <img src={r.photo} alt={r.name} loading="lazy" className="h-11 w-11 rounded-full object-cover" />
                <div>
                  <div className="text-sm font-bold">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.pet}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-8 flex items-center justify-center gap-2">
          {REVIEWS.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to review ${i + 1}`}
              onClick={() => setIdx(i)}
              className={`h-2 rounded-full transition-all ${i === idx ? "w-8 bg-primary" : "w-2 bg-border"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ FAQ ------------------------------ */

function Faq() {
  const { t } = useI18n();
  const [open, setOpen] = useState<number>(0);
  const items = [
    ["faq_q1", "faq_a1"],
    ["faq_q2", "faq_a2"],
    ["faq_q3", "faq_a3"],
    ["faq_q4", "faq_a4"],
    ["faq_q5", "faq_a5"],
    ["faq_q6", "faq_a6"],
  ] as const;
  return (
    <section id="faq" className="py-20 md:py-28 bg-cream">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHead eyebrow={t("faq_eyebrow")} title={t("faq_title")} />
        <div className="mt-10 space-y-3">
          {items.map(([q, a], i) => {
            const isOpen = open === i;
            return (
              <div key={q} className="rounded-2xl bg-white border border-border overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="w-full flex items-center justify-between text-left px-5 md:px-6 py-5 gap-4"
                >
                  <span className="text-[15px] md:text-base font-semibold">{t(q)}</span>
                  <ChevronDown className={`h-5 w-5 shrink-0 text-primary transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                <div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden">
                    <p className="px-5 md:px-6 pb-5 text-[15px] text-muted-foreground leading-relaxed">{t(a)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ LOCATION ------------------------------ */

function Location() {
  const { t } = useI18n();
  return (
    <section id="contact" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead eyebrow={t("loc_eyebrow")} title={t("loc_title")} sub={t("loc_sub")} />
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Info card */}
          <div className="rounded-[28px] overflow-hidden bg-cream border border-border shadow-[var(--shadow-card)]">
            <img src={location} alt="PetSStay entrance in Limassol" loading="lazy" width={1200} height={900} className="w-full h-56 object-cover object-center md:h-72" />
            <div className="p-6 md:p-7 space-y-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-primary">{t("cf_info_title")}</div>
                <div className="text-sm text-muted-foreground mt-1">{t("cf_info_sub")}</div>
              </div>
              <InfoRow icon={MapPin} label={t("loc_address")} value={t("loc_address_val")} />
              <InfoRow icon={Clock} label={t("loc_hours")} value={t("loc_hours_val")} />
              <InfoRow icon={Phone} label={t("loc_phone")} value={PHONE_DISPLAY} href={`tel:${PHONE_DISPLAY.replace(/\s/g, "")}`} />
              <InfoRow icon={MessageCircle} label={t("loc_whatsapp")} value={PHONE_DISPLAY} href={WHATSAPP} />
              <InfoRow icon={Mail} label={t("loc_email")} value="hello@petsstay.cy" href="mailto:hello@petsstay.cy" />
              <a
                href="#book"
                className="btn-hero mt-2 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold w-full"
              >
                {t("cta_book_stay")} <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="https://www.google.com/maps?q=Limassol+Cyprus"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold w-full border border-border hover:bg-white transition-colors"
              >
                {t("loc_directions")} <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* RIGHT: Map */}
          <div className="rounded-[28px] overflow-hidden bg-white border border-border shadow-[var(--shadow-card)] min-h-[420px]">
            <iframe
              title="PetSStay Limassol location"
              src="https://www.google.com/maps?q=Limassol,+Cyprus&output=embed"
              loading="lazy"
              className="w-full h-full min-h-[420px] border-0"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}



function InfoRow({ icon: Icon, label, value, href }: { icon: typeof MapPin; label: string; value: string; href?: string }) {
  const inner = (
    <div className="flex items-start gap-3">
      <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-[15px] font-semibold">{value}</div>
      </div>
    </div>
  );
  return href ? (
    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="block hover:opacity-80 transition-opacity">
      {inner}
    </a>
  ) : (
    inner
  );
}

/* ------------------------------ FINAL CTA ------------------------------ */

function FinalCta() {
  const { t } = useI18n();
  return (
    <section className="pb-20 md:pb-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[32px] p-10 md:p-16 text-center text-primary-foreground shadow-[var(--shadow-float)]" style={{ background: "var(--gradient-sun)" }}>
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/15 blur-2xl" />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
              <Heart className="h-3.5 w-3.5" /> PetSStay Limassol
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight max-w-3xl mx-auto">
              {t("final_title")}
            </h2>
            <p className="mt-4 text-white/90 max-w-2xl mx-auto text-lg">{t("final_sub")}</p>
            <a href="#book" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white text-primary px-7 py-4 text-base font-bold hover:scale-[1.03] transition-transform">
              {t("cta_book_stay")} <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ FOOTER ------------------------------ */

function Footer() {
  const { t } = useI18n();
  return (
    <footer className="bg-foreground text-background/90">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl text-white" style={{ background: "var(--gradient-sun)" }}>
                <PawPrint className="h-5 w-5" />
              </span>
              <span className="text-xl font-extrabold text-white">
                Pet<span className="text-gradient">S</span>Stay
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-background/70 max-w-xs">{t("footer_tagline")}</p>
            <div className="mt-5 flex items-center gap-2">
              <a href="#" aria-label="Instagram" className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Facebook" className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href={WHATSAPP} aria-label="WhatsApp" className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-background/60">{t("footer_nav")}</div>
            <ul className="mt-4 space-y-2 text-sm">
              {NAV.map((n) => (
                <li key={n.key}>
                  <a href={n.href} className="hover:text-white transition-colors">{t(n.key)}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-background/60">{t("footer_hours")}</div>
            <ul className="mt-4 space-y-2 text-sm">
              <li>{t("loc_hours_val")}</li>
              <li className="text-background/60">{t("footer_reception")}</li>
            </ul>
          </div>

          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-background/60">{t("footer_contact")}</div>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a href={`tel:${PHONE_DISPLAY.replace(/\s/g, "")}`} className="hover:text-white transition-colors">{PHONE_DISPLAY}</a></li>
              <li><a href={WHATSAPP} className="hover:text-white transition-colors">WhatsApp</a></li>
              <li><a href="mailto:hello@petsstay.cy" className="hover:text-white transition-colors">hello@petsstay.cy</a></li>
              <li className="text-background/60">{t("loc_address_val")}</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-background/60">
          <div>© {new Date().getFullYear()} PetSStay. {t("footer_rights")}</div>
          <div className="inline-flex items-center gap-1">{t("footer_made")} <Heart className="inline h-3 w-3 text-primary fill-primary" /></div>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------ WHATSAPP FAB ------------------------------ */

function WhatsAppFab() {
  const { t } = useI18n();
  const [showTip, setShowTip] = useState(false);
  useEffect(() => {
    const id = setInterval(() => {
      setShowTip(true);
      setTimeout(() => setShowTip(false), 3500);
    }, 8000);
    return () => clearInterval(id);
  }, []);
  return (
    <a
      href={WHATSAPP}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-50 group"
      aria-label="Chat on WhatsApp"
    >
      <div className={`absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-white shadow-[var(--shadow-card)] px-4 py-2 text-sm font-semibold text-foreground transition-all ${showTip ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 pointer-events-none"} group-hover:opacity-100 group-hover:translate-x-0`}>
        {t("wa_tooltip")}
      </div>
      <span
        className="relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_10px_30px_-8px_rgba(37,211,102,0.65)] animate-pulse-ring hover:scale-105 transition-transform"
        style={{ background: "#25D366" }}
      >
        <svg viewBox="0 0 32 32" className="h-7 w-7 fill-current" aria-hidden="true">
          <path d="M19.1 17.3c-.3-.2-1.9-1-2.2-1.1-.3-.1-.5-.2-.8.2-.2.3-.9 1.1-1.1 1.3-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.7.1-.1.3-.4.5-.6.1-.2.2-.3.3-.5.1-.2 0-.4 0-.6 0-.2-.7-1.8-1-2.4-.3-.6-.6-.5-.8-.5h-.7c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.2 1.4 3.5c.2.2 2.4 3.6 5.8 5 3.4 1.4 3.4 1 4 .9.6-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5 0-.2-.3-.3-.6-.5zM16 4C9.4 4 4 9.4 4 16c0 2.1.6 4.1 1.6 5.9L4 28l6.3-1.6c1.7.9 3.7 1.4 5.7 1.4 6.6 0 12-5.4 12-12S22.6 4 16 4z" />
        </svg>
      </span>
    </a>
  );
}
