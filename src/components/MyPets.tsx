import { useEffect, useState, type FormEvent } from "react";
import { Plus, Pencil, Trash2, PawPrint, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import {
  getMyPets,
  createPet,
  updatePet,
  deletePet,
  validatePet,
  type PetInput,
} from "@/lib/services";

type Pet = {
  id: string;
  pet_name: string;
  pet_type: string;
  breed: string | null;
  age: number | null;
  weight: number | null;
  gender: string | null;
  photo_url: string | null;
  vaccination_status: string | null;
  medical_notes: string | null;
  allergies: string | null;
  feeding_schedule: string | null;
  behavior_notes: string | null;
  emergency_contact: string | null;
};

const empty: PetInput = {
  pet_name: "",
  pet_type: "dog",
  breed: "",
  age: null,
  weight: null,
  gender: "",
  photo_url: "",
  vaccination_status: "",
  medical_notes: "",
  allergies: "",
  feeding_schedule: "",
  behavior_notes: "",
  emergency_contact: "",
};

export function MyPets() {
  const { t } = useI18n();
  const [pets, setPets] = useState<Pet[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [editing, setEditing] = useState<Pet | null>(null);
  const [creating, setCreating] = useState(false);
  const [banner, setBanner] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);

  const load = async () => {
    try {
      const rows = await getMyPets();
      setPets(rows as Pet[]);
    } catch (e) {
      console.error("[MyPets]", e);
      setLoadError(t("pets_load_error"));
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCreated = async () => {
    setCreating(false);
    setBanner({ kind: "ok", msg: t("pets_save_success") });
    await load();
  };
  const onUpdated = async () => {
    setEditing(null);
    setBanner({ kind: "ok", msg: t("pets_save_success") });
    await load();
  };
  const onDelete = async (id: string) => {
    if (!window.confirm(t("pets_delete_confirm"))) return;
    try {
      await deletePet(id);
      setBanner({ kind: "ok", msg: t("pets_delete_success") });
      await load();
    } catch (e) {
      console.error("[MyPets delete]", e);
      setBanner({ kind: "err", msg: t("pets_delete_error") });
    }
  };

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">{t("dash_my_pets")}</h2>
        {pets && pets.length > 0 && !creating && !editing && (
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 text-sm font-semibold shadow-sm"
          >
            <Plus className="h-4 w-4" />
            {t("pets_add")}
          </button>
        )}
      </div>

      {banner && (
        <div
          className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
            banner.kind === "ok"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <span>{banner.msg}</span>
            <button onClick={() => setBanner(null)} aria-label="dismiss">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {loadError && <p className="mt-4 text-sm text-destructive">{loadError}</p>}

      {!loadError && pets === null && (
        <p className="mt-4 text-sm text-muted-foreground">{t("pets_loading")}</p>
      )}

      {creating && (
        <PetForm
          initial={empty}
          onCancel={() => setCreating(false)}
          onSubmit={async (v) => {
            await createPet(v);
            await onCreated();
          }}
          onError={() => setBanner({ kind: "err", msg: t("pets_save_error") })}
        />
      )}

      {editing && (
        <PetForm
          initial={toInput(editing)}
          onCancel={() => setEditing(null)}
          onSubmit={async (v) => {
            await updatePet(editing.id, v);
            await onUpdated();
          }}
          onError={() => setBanner({ kind: "err", msg: t("pets_save_error") })}
        />
      )}

      {!loadError && pets !== null && pets.length === 0 && !creating && (
        <div className="mt-6 rounded-3xl border border-border bg-cream/40 p-8 text-center">
          <PawPrint className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">{t("pets_empty")}</p>
          <button
            onClick={() => setCreating(true)}
            className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 text-sm font-semibold shadow-sm"
          >
            <Plus className="h-4 w-4" />
            {t("pets_add")}
          </button>
        </div>
      )}

      {!loadError && pets && pets.length > 0 && !creating && !editing && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pets.map((p) => (
            <article
              key={p.id}
              className="rounded-3xl border border-border bg-white p-5 shadow-[var(--shadow-card)]"
            >
              <div className="flex items-start gap-4">
                {p.photo_url ? (
                  <img
                    src={p.photo_url}
                    alt={p.pet_name}
                    className="h-16 w-16 rounded-2xl object-cover"
                    onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                  />
                ) : (
                  <div className="h-16 w-16 rounded-2xl bg-cream flex items-center justify-center">
                    <PawPrint className="h-7 w-7 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold truncate">{p.pet_name}</h3>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mt-0.5">
                    {t((`book_${p.pet_type}` as unknown) as never) || p.pet_type}
                  </p>
                </div>
              </div>
              <dl className="mt-4 space-y-1.5 text-sm">
                {p.breed && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">{t("pet_breed")}</dt>
                    <dd className="font-medium text-right truncate">{p.breed}</dd>
                  </div>
                )}
                {p.age != null && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">{t("pet_age")}</dt>
                    <dd className="font-medium">{p.age}</dd>
                  </div>
                )}
                {p.vaccination_status && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">{t("pet_vaccination")}</dt>
                    <dd className="font-medium text-right truncate">{p.vaccination_status}</dd>
                  </div>
                )}
              </dl>
              <div className="mt-5 flex items-center gap-2">
                <button
                  onClick={() => setEditing(p)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-1.5 text-xs font-semibold hover:bg-cream"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  {t("pets_edit")}
                </button>
                <button
                  onClick={() => onDelete(p.id)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white text-red-600 px-3.5 py-1.5 text-xs font-semibold hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t("pets_delete")}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function toInput(p: Pet): PetInput {
  return {
    pet_name: p.pet_name,
    pet_type: p.pet_type,
    breed: p.breed ?? "",
    age: p.age,
    weight: p.weight,
    gender: p.gender ?? "",
    photo_url: p.photo_url ?? "",
    vaccination_status: p.vaccination_status ?? "",
    medical_notes: p.medical_notes ?? "",
    allergies: p.allergies ?? "",
    feeding_schedule: p.feeding_schedule ?? "",
    behavior_notes: p.behavior_notes ?? "",
    emergency_contact: p.emergency_contact ?? "",
  };
}

function PetForm({
  initial,
  onSubmit,
  onCancel,
  onError,
}: {
  initial: PetInput;
  onSubmit: (v: PetInput) => Promise<void>;
  onCancel: () => void;
  onError: () => void;
}) {
  const { t } = useI18n();
  const [v, setV] = useState<PetInput>(initial);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof PetInput>(k: K, val: PetInput[K]) =>
    setV((s) => ({ ...s, [k]: val }));

  const errMsg = (code: string) => {
    if (code === "required") return t("pet_err_required");
    if (code === "url") return t("pet_err_url");
    if (code === "invalid") return "";
    return "";
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const list = validatePet(v);
    if (list.length) {
      const map: Record<string, string> = {};
      for (const er of list) {
        if (er.field === "age") map.age = t("pet_err_age");
        else if (er.field === "weight") map.weight = t("pet_err_weight");
        else map[er.field] = errMsg(er.code);
      }
      setErrs(map);
      return;
    }
    setErrs({});
    setSaving(true);
    try {
      await onSubmit(v);
    } catch (err) {
      console.error("[PetForm]", err);
      onError();
    } finally {
      setSaving(false);
    }
  };

  const labelCls = "text-xs font-semibold text-muted-foreground";
  const inputCls =
    "mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400";
  const errCls = "mt-1 text-xs text-red-600";

  return (
    <form
      onSubmit={submit}
      className="mt-6 rounded-3xl border border-border bg-white p-6 shadow-[var(--shadow-card)]"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>{t("pet_name")} *</label>
          <input
            className={inputCls}
            value={v.pet_name}
            onChange={(e) => set("pet_name", e.target.value)}
            maxLength={80}
          />
          {errs.pet_name && <p className={errCls}>{errs.pet_name}</p>}
        </div>
        <div>
          <label className={labelCls}>{t("pet_type")} *</label>
          <select
            className={inputCls}
            value={v.pet_type}
            onChange={(e) => set("pet_type", e.target.value)}
          >
            <option value="dog">{t("book_dog")}</option>
            <option value="cat">{t("book_cat")}</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>{t("pet_breed")}</label>
          <input
            className={inputCls}
            value={v.breed ?? ""}
            onChange={(e) => set("breed", e.target.value)}
            maxLength={80}
          />
        </div>
        <div>
          <label className={labelCls}>{t("pet_gender")}</label>
          <select
            className={inputCls}
            value={v.gender ?? ""}
            onChange={(e) => set("gender", e.target.value)}
          >
            <option value="">{t("pet_gender_unspecified")}</option>
            <option value="male">{t("pet_gender_male")}</option>
            <option value="female">{t("pet_gender_female")}</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>{t("pet_age")}</label>
          <input
            type="number"
            min={0}
            max={40}
            step="0.1"
            className={inputCls}
            value={v.age ?? ""}
            onChange={(e) => set("age", e.target.value === "" ? null : Number(e.target.value))}
          />
          {errs.age && <p className={errCls}>{errs.age}</p>}
        </div>
        <div>
          <label className={labelCls}>{t("pet_weight")}</label>
          <input
            type="number"
            min={0}
            max={200}
            step="0.1"
            className={inputCls}
            value={v.weight ?? ""}
            onChange={(e) => set("weight", e.target.value === "" ? null : Number(e.target.value))}
          />
          {errs.weight && <p className={errCls}>{errs.weight}</p>}
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>{t("pet_photo_url")}</label>
          <input
            type="url"
            className={inputCls}
            value={v.photo_url ?? ""}
            onChange={(e) => set("photo_url", e.target.value)}
            placeholder="https://…"
          />
          {errs.photo_url && <p className={errCls}>{errs.photo_url}</p>}
        </div>
        <div>
          <label className={labelCls}>{t("pet_vaccination")}</label>
          <input
            className={inputCls}
            value={v.vaccination_status ?? ""}
            onChange={(e) => set("vaccination_status", e.target.value)}
            maxLength={200}
          />
        </div>
        <div>
          <label className={labelCls}>{t("pet_emergency")}</label>
          <input
            className={inputCls}
            value={v.emergency_contact ?? ""}
            onChange={(e) => set("emergency_contact", e.target.value)}
            maxLength={200}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>{t("pet_allergies")}</label>
          <textarea
            className={inputCls}
            rows={2}
            value={v.allergies ?? ""}
            onChange={(e) => set("allergies", e.target.value)}
            maxLength={1000}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>{t("pet_feeding")}</label>
          <textarea
            className={inputCls}
            rows={2}
            value={v.feeding_schedule ?? ""}
            onChange={(e) => set("feeding_schedule", e.target.value)}
            maxLength={1000}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>{t("pet_medical")}</label>
          <textarea
            className={inputCls}
            rows={2}
            value={v.medical_notes ?? ""}
            onChange={(e) => set("medical_notes", e.target.value)}
            maxLength={1000}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>{t("pet_behavior")}</label>
          <textarea
            className={inputCls}
            rows={2}
            value={v.behavior_notes ?? ""}
            onChange={(e) => set("behavior_notes", e.target.value)}
            maxLength={1000}
          />
        </div>
      </div>
      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-5 py-2.5 text-sm font-semibold shadow-sm"
        >
          {saving ? t("pets_saving") : t("pets_save")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-border bg-white px-5 py-2.5 text-sm font-semibold hover:bg-cream"
        >
          {t("pets_cancel")}
        </button>
      </div>
    </form>
  );
}
