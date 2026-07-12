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
import galleryCatHappy from "@/assets/gallery/cat-happy.jpg.asset.json";
import galleryDogsWalk from "@/assets/gallery/dogs-walk.jpg.asset.json";
import galleryCatRelax from "@/assets/gallery/cat-relax.jpg.asset.json";
import galleryDog from "@/assets/gallery/dog.jpg.asset.json";
import galleryCatDogsEats from "@/assets/gallery/cat-dogs-eats.jpg.asset.json";
import galleryPetCuddle from "@/assets/gallery/pet-cuddle.jpg.asset.json";

const unsplash = (id: string, w = 1600, q = 80) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=${q}`;

/** Hero: warm interaction between a person and a dog. */
export const heroImage = unsplash("photo-1450778869180-41d0601e046e", 1800);

/**
 * Gallery: "A day at PetSStay" — local project assets provided by the client.
 *
 * Slots 0 and 4 are tall (row-span-2) → portrait-oriented photos.
 * Slots 1, 2, 3, 5 are standard cells → landscape-oriented photos.
 */
export const galleryImages: { src: string; alt: string; span?: string; position?: string }[] = [
  // 0 — CAT + person (portrait, tall slot)
  { src: galleryCatHappy.url, alt: "Woman gently petting a happy ginger cat lying on a soft blanket", span: "row-span-2", position: "object-center" },
  // 1 — DOG outdoor walk (landscape)
  { src: galleryDogsWalk.url, alt: "Labrador puppy walking on a leash beside its owner outdoors", span: "", position: "object-center" },
  // 2 — CAT relaxing indoors (landscape)
  { src: galleryCatRelax.url, alt: "Tabby cat with green eyes relaxing on a soft carpet indoors", span: "", position: "object-center" },
  // 3 — Person cuddling dog and cat together (landscape)
  { src: galleryPetCuddle.url, alt: "Caregiver affectionately cuddling a dog and a cat together at home", span: "", position: "object-center" },
  // 4 — Happy corgi (portrait, tall slot)
  { src: galleryDog.url, alt: "Smiling corgi sitting on a wooden bench raising its paw in warm evening light", span: "row-span-2", position: "object-center" },
  // 5 — Feeding time: dog and cat sharing a meal (landscape)
  { src: galleryCatDogsEats.url, alt: "Dog and cat eating together from bowls during daily feeding time", span: "", position: "object-top" },
];

/** Team portraits — authentic Unsplash portraits (2 women, 1 man). */
export const teamPhotos = {
  // Maria Ioannou — Founder & Head Caretaker (woman, 30s, confident & warm)
  member1: unsplash("photo-1573496359142-b8d87734a5a2", 800),
  // Andreas Petrou — Resident Veterinarian (man, 30s, kind & approachable)
  member2: unsplash("photo-1531427186611-ecfd6d936c79", 800),
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
