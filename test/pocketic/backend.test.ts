import { PocketIc } from "@dfinity/pic";
import type { Actor, CanisterFixture } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";

let pic: PocketIc | undefined;
let actor: Actor<_SERVICE>;
let canisterId: CanisterFixture<_SERVICE>["canisterId"];

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  ({ actor, canisterId } = await pic.setupCanister<_SERVICE>({
    idlFactory,
    wasm: BACKEND_WASM,
  }));
});

afterAll(async () => {
  await pic?.tearDown();
});

it("answers the profile read instead of trapping", async () => {
  const profile = await actor.getProfile();
  expect(profile.name).toContain("DUM");
  expect(profile.rating).toBeCloseTo(4.6, 5);
  expect(profile.reviewCount).toBe(1024n);
  expect(profile.priceRangeLow).toBe(400n);
  expect(profile.priceRangeHigh).toBe(1600n);
  expect(profile.addressLine2).toBe("Indiranagar");
  expect(profile.phone).toBe("099000 06552");
});

it("lists categories and menu items with veg markers and no per-dish price", async () => {
  const categories = await actor.listCategories();
  expect(categories.length).toBeGreaterThan(0);

  const items = await actor.listMenuItems();
  expect(items.length).toBeGreaterThan(0);
  const sample = items[0];
  expect(typeof sample.name).toBe("string");
  expect(typeof sample.isVeg).toBe("boolean");
  // Per-dish prices were removed from the public menu shape.
  expect(sample).not.toHaveProperty("price");
});

it("filters menu items by category through the real canister", async () => {
  const categories = await actor.listCategories();
  const first = categories[0];
  const scoped = await actor.listMenuItemsByCategory(first.id);
  expect(scoped.length).toBeGreaterThan(0);
  expect(scoped.every((item) => item.categoryId === first.id)).toBe(true);
});

it("returns reviews and a rating breakdown", async () => {
  const reviews = await actor.listReviews();
  expect(reviews.length).toBeGreaterThan(0);
  expect(reviews[0].reviewerName.length).toBeGreaterThan(0);
  expect(reviews[0].rating).toBeGreaterThan(0n);

  const breakdown = await actor.getRatingBreakdown();
  expect(breakdown.length).toBeGreaterThan(0);
  expect(breakdown.some((row) => row.stars === 5n)).toBe(true);
});

it("returns gallery photos with image references", async () => {
  const photos = await actor.listPhotos();
  expect(photos.length).toBeGreaterThan(0);
  expect(photos[0].imageRef.length).toBeGreaterThan(0);
});

it("offers opening-hours time slots for a future date", async () => {
  // A far-future date is open every day, so the slot list is non-empty.
  const slots = await actor.listAvailableSlots("2099-12-31");
  expect(slots.length).toBeGreaterThan(0);
  expect(slots.every((slot) => typeof slot.time === "string")).toBe(true);
  expect(slots.some((slot) => slot.available)).toBe(true);
});

it("round-trips a reservation through the real canister", async () => {
  const slots = await actor.listAvailableSlots("2099-12-31");
  const openSlot = slots.find((slot) => slot.available);
  expect(openSlot).toBeDefined();

  const result = await actor.createReservation({
    guestName: "Ada Lovelace",
    phone: "09900006552",
    email: "ada@example.com",
    partySize: 2n,
    date: "2099-12-31",
    timeSlot: openSlot?.time ?? "",
    specialRequests: ["Window table"],
  });

  expect(result).toHaveProperty("ok");
  if (!("ok" in result)) {
    throw new Error(`expected ok, got ${JSON.stringify(result)}`);
  }
  expect(result.ok.reference).toMatch(/^DUM-/);
  expect(result.ok.status).toEqual({ pending: null });
  expect(result.ok.guestName).toBe("Ada Lovelace");
});

it("rejects a reservation on a past date", async () => {
  const result = await actor.createReservation({
    guestName: "Ada Lovelace",
    phone: "09900006552",
    email: "ada@example.com",
    partySize: 2n,
    date: "2000-01-01",
    timeSlot: "12:00",
    specialRequests: [],
  });

  expect(result).toEqual({ err: { pastDate: null } });
});

it("hides reservations from an anonymous caller", async () => {
  // A freshly created actor calls as the anonymous principal until an identity
  // is set, and the backend returns an empty list for non-staff callers.
  const guest = pic?.createActor<_SERVICE>(idlFactory, canisterId);
  expect(guest).toBeDefined();
  await expect(guest?.listReservations([], [])).resolves.toEqual([]);
});
