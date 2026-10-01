import type {
  MenuCategory,
  MenuItem,
  Photo,
  RatingBreakdown,
  RestaurantProfile,
  Review,
} from "@/backend";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import App from "@/App";

/**
 * Typed local fixtures mirroring the backend's public read shapes. The data
 * hooks are mocked at the module seam so the real components render against
 * deterministic data without a canister or an Internet Identity provider.
 */
const PROFILE: RestaurantProfile = {
  name: "DUM | The Royal Biryani Kitchen",
  tagline:
    "Slow-cooked Awadhi biryani, dum-sealed and served with royal intent.",
  cuisine: "Biryani · Indian",
  rating: 4.6,
  reviewCount: 1024n,
  priceRangeLow: 400n,
  priceRangeHigh: 1600n,
  priceRangeNote: "per person",
  tags: ["Happy-hour food", "Vegetarian options", "Kids' menu"],
  addressLine1: "35, 80 Feet Rd, HAL 3rd Stage",
  addressLine2: "Indiranagar",
  city: "Bengaluru",
  state: "Karnataka",
  postalCode: "560075",
  phone: "099000 06552",
  hoursSummary: "Open daily · 11 am – 2 am",
  closingTime: "2 am",
};

const CATEGORIES: MenuCategory[] = [
  {
    id: 1n,
    name: "Biryani",
    description: "Sealed-pot dum biryanis.",
    order: 1n,
  },
  { id: 2n, name: "Breads", description: "Freshly rolled naans.", order: 2n },
];

const MENU_ITEMS: MenuItem[] = [
  {
    id: 101n,
    categoryId: 1n,
    order: 1n,
    name: "Hyderabadi Dum Chicken Biryani",
    description: "Signature. Long-grain basmati and tender chicken.",
    isVeg: false,
    isSignature: true,
  },
  {
    id: 103n,
    categoryId: 1n,
    order: 2n,
    name: "Subz Dum Biryani",
    description: "Seasonal vegetables and paneer sealed with basmati.",
    isVeg: true,
    isSignature: false,
  },
  {
    id: 401n,
    categoryId: 2n,
    order: 1n,
    name: "Butter Naan",
    description: "Soft tandoor-baked naan brushed with butter.",
    isVeg: true,
    isSignature: false,
  },
];

const REVIEWS: Review[] = [
  {
    id: 1n,
    reviewerName: "Ananya Rao",
    rating: 5n,
    date: "2026-08-14",
    text: "The Royal Mutton Dum Biryani is the real deal.",
  },
  {
    id: 2n,
    reviewerName: "Karthik Menon",
    rating: 5n,
    date: "2026-08-02",
    text: "Came for the kebabs and stayed for the Double Ka Meetha.",
  },
];

const BREAKDOWN: RatingBreakdown[] = [
  { stars: 5n, count: 742n },
  { stars: 4n, count: 205n },
  { stars: 3n, count: 51n },
  { stars: 2n, count: 16n },
  { stars: 1n, count: 10n },
];

const PHOTOS: Photo[] = [
  {
    id: 1n,
    title: "Royal Mutton Dum Biryani",
    caption: "Sealed-pot biryani opened at the table.",
    imageRef: "royal-mutton-dum-biryani",
  },
  {
    id: 2n,
    title: "Murgh Malai Kebab",
    caption: "Creamy kebabs fresh off the skewer.",
    imageRef: "murgh-malai-kebab",
  },
];

const hooks = vi.hoisted(() => ({
  useProfile: vi.fn(),
  useCategories: vi.fn(),
  useMenuItems: vi.fn(),
  useReviews: vi.fn(),
  useRatingBreakdown: vi.fn(),
  usePhotos: vi.fn(),
  useAvailableSlots: vi.fn(),
  useCreateReservation: vi.fn(),
  useReservations: vi.fn(),
  useConfirmReservation: vi.fn(),
  useCancelReservation: vi.fn(),
  reservationErrorMessage: vi.fn(
    (error: { __kind__: string }) => error.__kind__,
  ),
}));

vi.mock("@/hooks/use-restaurant", () => hooks);

// The header and staff page read Internet Identity state. The real hook throws
// without its provider, so the module seam is mocked with a signed-out guest.
const auth = vi.hoisted(() => ({
  useInternetIdentity: vi.fn(),
}));

vi.mock("@caffeineai/core-infrastructure", () => auth);

function seedLoadedData() {
  hooks.useProfile.mockReturnValue({ data: PROFILE, isLoading: false });
  hooks.useCategories.mockReturnValue({ data: CATEGORIES, isLoading: false });
  hooks.useMenuItems.mockReturnValue({ data: MENU_ITEMS, isLoading: false });
  hooks.useReviews.mockReturnValue({ data: REVIEWS, isLoading: false });
  hooks.useRatingBreakdown.mockReturnValue({
    data: BREAKDOWN,
    isLoading: false,
  });
  hooks.usePhotos.mockReturnValue({ data: PHOTOS, isLoading: false });
  hooks.useAvailableSlots.mockReturnValue({
    data: [],
    isLoading: false,
    isError: false,
  });
  hooks.useCreateReservation.mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
  });
  hooks.useReservations.mockReturnValue({
    data: [],
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  });
  hooks.useConfirmReservation.mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
    variables: undefined,
  });
  hooks.useCancelReservation.mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
    variables: undefined,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  seedLoadedData();
  auth.useInternetIdentity.mockReturnValue({
    isAuthenticated: false,
    isInitializing: false,
    isLoggingIn: false,
    login: vi.fn(),
    clear: vi.fn(),
  });
  // jsdom does not implement scrollIntoView; the header and hero call it.
  Element.prototype.scrollIntoView = vi.fn();
});

describe("App shell", () => {
  it("renders the header, hero, and footer without a blank screen", () => {
    render(<App />);

    expect(screen.getByTestId("site.header")).toBeInTheDocument();
    expect(screen.getByTestId("overview.section")).toBeInTheDocument();
    expect(screen.getByTestId("site.footer")).toBeInTheDocument();
    expect(
      screen.getAllByText("DUM | The Royal Biryani Kitchen").length,
    ).toBeGreaterThan(0);
  });

  it("exposes every section link in the primary navigation", () => {
    render(<App />);

    const nav = screen.getByRole("navigation", { name: "Primary" });
    for (const label of ["Overview", "Menu", "Reviews", "Photos", "Visit"]) {
      expect(
        within(nav).getByRole("button", { name: label }),
      ).toBeInTheDocument();
    }
  });

  it("opens and closes the mobile navigation menu", async () => {
    const user = userEvent.setup();
    render(<App />);

    const toggle = screen.getByTestId("site.menu_toggle");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByTestId("site.mobile_menu")).not.toBeInTheDocument();

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    const mobileMenu = screen.getByTestId("site.mobile_menu");
    expect(
      within(mobileMenu).getByRole("button", { name: "Menu" }),
    ).toBeInTheDocument();

    await user.click(toggle);
    expect(screen.queryByTestId("site.mobile_menu")).not.toBeInTheDocument();
  });
});

describe("Hero", () => {
  it("shows the name, rating, review count, and price range", () => {
    render(<App />);

    const hero = screen.getByTestId("overview.section");
    expect(
      within(hero).getByRole("heading", {
        name: "DUM | The Royal Biryani Kitchen",
      }),
    ).toBeInTheDocument();
    expect(within(hero).getByText("4.6")).toBeInTheDocument();
    expect(within(hero).getByText("(1,024 reviews)")).toBeInTheDocument();
    expect(within(hero).getByText("₹400–₹1,600")).toBeInTheDocument();
  });

  it("renders the highlight chips and a biryani hero image", () => {
    render(<App />);

    const hero = screen.getByTestId("overview.section");
    expect(within(hero).getByText("Happy-hour food")).toBeInTheDocument();
    expect(within(hero).getByText("Vegetarian options")).toBeInTheDocument();
    expect(within(hero).getByText("Kids' menu")).toBeInTheDocument();

    const image = within(hero).getByAltText(/royal biryani feast/i);
    expect(image).toHaveAttribute(
      "src",
      expect.stringContaining("hero-biryani-feast"),
    );
  });

  it("links the call action to a tel: URL and directions to Google Maps", () => {
    render(<App />);

    const hero = screen.getByTestId("overview.section");
    expect(within(hero).getByTestId("overview.call_button")).toHaveAttribute(
      "href",
      "tel:09900006552",
    );
    expect(
      within(hero)
        .getByTestId("overview.directions_button")
        .getAttribute("href"),
    ).toContain("google.com/maps/dir");
  });
});

describe("Menu", () => {
  it("renders categorized items with veg/non-veg indicators and no dish prices", () => {
    render(<App />);

    const menu = screen.getByTestId("menu.section");
    expect(
      within(menu).getByText("Hyderabadi Dum Chicken Biryani"),
    ).toBeInTheDocument();
    expect(within(menu).getByLabelText("Non-vegetarian")).toBeInTheDocument();
    expect(within(menu).getAllByLabelText("Vegetarian").length).toBeGreaterThan(
      0,
    );
    // Per-dish prices were removed; no rupee amount may appear in the menu.
    expect(within(menu).queryByText(/₹/)).not.toBeInTheDocument();
  });

  it("filters items when a category tab is selected", async () => {
    const user = userEvent.setup();
    render(<App />);

    const menu = screen.getByTestId("menu.section");
    await user.click(within(menu).getByRole("tab", { name: "Breads" }));

    expect(within(menu).getByText("Butter Naan")).toBeInTheDocument();
    expect(
      within(menu).queryByText("Hyderabadi Dum Chicken Biryani"),
    ).not.toBeInTheDocument();
  });

  it("searches the menu and shows an empty state for no matches", async () => {
    const user = userEvent.setup();
    render(<App />);

    const menu = screen.getByTestId("menu.section");
    const search = within(menu).getByLabelText("Search the menu");

    await user.type(search, "naan");
    expect(within(menu).getByText("Butter Naan")).toBeInTheDocument();
    expect(
      within(menu).queryByText("Subz Dum Biryani"),
    ).not.toBeInTheDocument();

    await user.clear(search);
    await user.type(search, "sushi");
    expect(within(menu).getByTestId("menu.empty_state")).toBeInTheDocument();
  });
});

describe("Reservation call-to-action", () => {
  it("opens the reservation form from the header CTA", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.queryByTestId("reservation.dialog")).not.toBeInTheDocument();
    await user.click(screen.getByTestId("site.reserve_button"));

    const dialog = await screen.findByTestId("reservation.dialog");
    expect(
      within(dialog).getByRole("heading", { name: "Reserve a Table" }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByTestId("reservation.name_input"),
    ).toBeInTheDocument();
  });

  it("opens the reservation form from the Visit section CTA", async () => {
    const user = userEvent.setup();
    render(<App />);

    const visit = screen.getByTestId("visit.section");
    await user.click(within(visit).getByTestId("visit.reserve_button"));

    const dialog = await screen.findByTestId("reservation.dialog");
    expect(
      within(dialog).getByRole("heading", { name: "Reserve a Table" }),
    ).toBeInTheDocument();
  });
});

describe("Photos", () => {
  it("opens a clicked photo in the lightbox", async () => {
    const user = userEvent.setup();
    render(<App />);

    const photos = screen.getByTestId("photos.section");
    await user.click(within(photos).getByTestId("photos.item.2"));

    const lightbox = await screen.findByTestId("photos.lightbox");
    expect(within(lightbox).getByText("Murgh Malai Kebab")).toBeInTheDocument();
    expect(
      within(lightbox).getByText("Creamy kebabs fresh off the skewer."),
    ).toBeInTheDocument();
  });
});

describe("Reviews", () => {
  it("shows the overall rating, count, breakdown, and written reviews", () => {
    render(<App />);

    const reviews = screen.getByTestId("reviews.section");
    expect(within(reviews).getByText("4.6")).toBeInTheDocument();
    expect(within(reviews).getByText("1,024 reviews")).toBeInTheDocument();
    expect(
      within(reviews).getByTestId("reviews.breakdown.5"),
    ).toBeInTheDocument();
    expect(within(reviews).getByText("Ananya Rao")).toBeInTheDocument();
    expect(
      within(reviews).getByText(
        "The Royal Mutton Dum Biryani is the real deal.",
      ),
    ).toBeInTheDocument();
  });
});

describe("Visit", () => {
  it("shows the full Indiranagar address, a map, and a click-to-call link", () => {
    render(<App />);

    const visit = screen.getByTestId("visit.section");
    expect(
      within(visit).getByText(
        "35, 80 Feet Rd, HAL 3rd Stage, Indiranagar, Bengaluru, Karnataka 560075",
      ),
    ).toBeInTheDocument();
    expect(within(visit).getByTestId("visit.map")).toHaveAttribute(
      "src",
      expect.stringContaining("google.com/maps"),
    );
    expect(within(visit).getByTestId("visit.call_button")).toHaveAttribute(
      "href",
      "tel:09900006552",
    );
  });

  it("copies the page link when the share action is used", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(<App />);
    await user.click(screen.getByTestId("visit.share_button"));

    expect(writeText).toHaveBeenCalledWith(window.location.href);
    expect(
      await screen.findByRole("button", { name: /link copied/i }),
    ).toBeInTheDocument();
  });
});
