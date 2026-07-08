/**
 * Centralized image configuration for PetSStay.
 *
 * All people / pet / pet-care images are authentic photographs
 * sourced from Unsplash (https://unsplash.com/license — free for
 * commercial use).
 *
 * ⚠️ PROTECTED BRAND IMAGE — DO NOT REPLACE
 * -----------------------------------------
 * `locationBuilding` is the generated PetSStay building image with
 * the PetSStay sign. It visually represents the physical agency
 * location in Limassol and must remain unchanged during any image
 * audit. Only swap it for a real, on-site photograph of the actual
 * PetSStay building.
 */

import locationBuilding from "@/assets/location.jpg";

const unsplash = (id: string, w = 1600, q = 80) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=${q}`;

/** Hero: warm interaction between a person and a dog. */
export const heroImage = unsplash("photo-1450778869180-41d0601e046e", 1800);

/**
 * Gallery: "A day at PetSStay" — exactly 3 cats + 3 dogs, distributed
 * across the grid to tell the story of a normal day of premium care
 * (affection, outdoor play, indoor rest, daily care, human interaction).
 *
 * Slots 0 and 4 are tall (row-span-2) → portrait-oriented photos.
 * Slots 1, 2, 3, 5 are standard cells → landscape-oriented photos.
 */
export const galleryImages: { src: string; alt: string; span?: string; position?: string }[] = [
  // 0 — CAT + person (portrait, tall slot) — woman smiling and gently petting a cat on her lap
  { src: unsplash("photo-1705461789675-65a4d7612396", 1200), alt: "Woman smiling and gently petting a cat resting on her lap", span: "row-span-2", position: "object-center" },
  // 1 — DOG outdoor play (landscape) — happy border collie by the sea
  { src: unsplash("photo-1587300003388-59208cc962cb", 900), alt: "Happy dog playing outdoors in warm daylight", span: "", position: "object-center" },
  // 2 — CAT relaxing indoors (landscape) — cat resting in warm sunlight
  { src: unsplash("photo-1526336024174-e58f5cdd8e13", 900), alt: "Relaxed cat resting comfortably in warm interior light", span: "", position: "object-center" },
  // 3 — DOG walking with a person (landscape) — dog on leash beside caregiver
  { src: unsplash("photo-1477884213360-7e9d7dcc1e48", 900), alt: "Friendly dog on a walk beside its caregiver outdoors", span: "", position: "object-center" },
  // 4 — CAT during feeding / daily care (portrait, tall slot) — ginger cat eating from a bowl
  { src: unsplash("photo-1558993457-4bc6ec2c3734", 1200), alt: "Ginger cat eating from a bowl during daily feeding", span: "row-span-2", position: "object-center" },
  // 5 — DOG + person (landscape) — hand affectionately petting a happy husky outdoors
  { src: unsplash("photo-1686807252495-98890c1fc8b8", 900), alt: "Pet sitter affectionately petting a happy dog outdoors", span: "", position: "object-center" },
];

/** Team portraits — authentic Unsplash portraits (2 women, 1 man). */
export const teamPhotos = {
  // Maria Ioannou — Founder & Head Caretaker (woman, 30s, confident & warm)
  member1: unsplash("photo-1494790108377-be9c29b29330", 800),
  // Andreas Petrou — Resident Veterinarian (man, 30s, kind & approachable)
  member2: unsplash("photo-1507003211169-0a1dd7228f2d", 800),
  // Elena Georgiou — Senior Pet Sitter (woman, late 20s, gentle & natural)
  member3: unsplash("photo-1760552069335-07d43ca826f4", 800),
};


/** Testimonial avatars — demo stock photos, replace with real customer photos later. */
export const reviewAvatars = [
  unsplash("photo-1544005313-94ddf0286df2", 200),
  unsplash("photo-1500648767791-00dcc994a43e", 200),
  unsplash("photo-1487412720507-e7ab37603c6f", 200),
  unsplash("photo-1517841905240-472988babdf9", 200),
  unsplash("photo-1502378735452-bc7d86632805", 200),
  unsplash("photo-1524504388940-b1c1722653e1", 200),
];

/** PROTECTED — PetSStay building/location image. Do not replace in image audits. */
export const locationImage = locationBuilding;
