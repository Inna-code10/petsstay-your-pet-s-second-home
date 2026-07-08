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

/** Gallery: cats, dogs, walks, care, cozy rest. */
export const galleryImages: { src: string; alt: string; span?: string; position?: string }[] = [
  { src: unsplash("photo-1526336024174-e58f5cdd8e13", 1200), alt: "Relaxed cat resting in a cozy bright interior", span: "row-span-2", position: "object-center" },
  { src: unsplash("photo-1573865526739-10659fec78a5", 900), alt: "Close-up of a friendly, healthy cat", span: "", position: "object-center" },
  { src: unsplash("photo-1592194996308-7b43878e84a6", 900), alt: "Person gently holding and caring for a cat", span: "", position: "object-center" },
  { src: unsplash("photo-1583337130417-3346a1be7dee", 900), alt: "Caregiver feeding a dog", span: "" },
  { src: unsplash("photo-1548199973-03cce0bbc87b", 1200), alt: "Person walking a dog outdoors in the sun", span: "row-span-2" },
  { src: unsplash("photo-1425082661705-1834bfd09dca", 900), alt: "Puppy sleeping peacefully", span: "" },
];

/** Team portraits — demo stock photos, replace with real staff photos later. */
export const teamPhotos = {
  member1: unsplash("photo-1573496359142-b8d87734a5a2", 800),
  member2: unsplash("photo-1580489944761-15a19d654956", 800),
  member3: unsplash("photo-1438761681033-6461ffad8d80", 800),
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
