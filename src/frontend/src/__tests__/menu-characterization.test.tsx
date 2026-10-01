import type { MenuCategory, MenuItem, RestaurantProfile } from "@/backend";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import App from "@/App";

/**
 * Characterization baseline for the menu section ahead of the dish-price
 * removal. These tests deliberately do NOT assert any per-dish price: that
 * behavior is the one the request intentionally changes. They pin the adjacent
 * card content (name, description, veg marker, signature badge), the hero
 * price range that must stay, and the tab/search reflow that must keep working
 * once the price column is gone.
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

// The header reads Internet Identity state; the real hook throws without its
// provider, so the module seam is mocked with a signed-out guest.
const auth = vi.hoisted(() => ({
  useInternetIdentity: vi.fn(),
}));

vi.mock("@caffeineai/core-infrastructure", () => auth);

beforeEach(() => {
  vi.clearAllMocks();
  hooks.useProfile.mockReturnValue({ data: PROFILE, isLoading: false });
  hooks.useCategories.mockReturnValue({ data: CATEGORIES, isLoading: false });
  hooks.useMenuItems.mockReturnValue({ data: MENU_ITEMS, isLoading: false });
  hooks.useReviews.mockReturnValue({ data: [], isLoading: false });
  hooks.useRatingBreakdown.mockReturnValue({ data: [], isLoading: false });
  hooks.usePhotos.mockReturnValue({ data: [], isLoading: false });
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
  auth.useInternetIdentity.mockReturnValue({
    isAuthenticated: false,
    isInitializing: false,
    isLoggingIn: false,
    login: vi.fn(),
    clear: vi.fn(),
  });
  Element.prototype.scrollIntoView = vi.fn();
});

describe("Menu card content that survives price removal", () => {
  it("renders each dish name and description", () => {
    render(<App />);

    const menu = screen.getByTestId("menu.section");
    expect(
      within(menu).getByText("Hyderabadi Dum Chicken Biryani"),
    ).toBeInTheDocument();
    expect(
      within(menu).getByText(
        "Signature. Long-grain basmati and tender chicken.",
      ),
    ).toBeInTheDocument();
    expect(within(menu).getByText("Butter Naan")).toBeInTheDocument();
    expect(
      within(menu).getByText("Soft tandoor-baked naan brushed with butter."),
    ).toBeInTheDocument();
  });

  it("keeps veg and non-veg markers on the dish cards", () => {
    render(<App />);

    const menu = screen.getByTestId("menu.section");
    expect(within(menu).getByLabelText("Non-vegetarian")).toBeInTheDocument();
    expect(within(menu).getAllByLabelText("Vegetarian").length).toBeGreaterThan(
      0,
    );
  });

  it("keeps the signature badge on signature dishes only", () => {
    render(<App />);

    const menu = screen.getByTestId("menu.section");
    const signatureCard = within(menu).getByTestId("menu.item.101");
    expect(within(signatureCard).getByText("Chef's pick")).toBeInTheDocument();

    const plainCard = within(menu).getByTestId("menu.item.103");
    expect(
      within(plainCard).queryByText("Chef's pick"),
    ).not.toBeInTheDocument();
  });

  it("keeps the hero price range while dish cards carry no price", () => {
    render(<App />);

    const hero = screen.getByTestId("overview.section");
    expect(within(hero).getByText("₹400–₹1,600")).toBeInTheDocument();

    // The menu section must not surface the hero range or any dish price.
    const menu = screen.getByTestId("menu.section");
    expect(within(menu).queryByText("₹400–₹1,600")).not.toBeInTheDocument();
  });
});

describe("Menu reflow controls that survive price removal", () => {
  it("filters by category tab and restores the full list", async () => {
    const user = userEvent.setup();
    render(<App />);

    const menu = screen.getByTestId("menu.section");
    await user.click(within(menu).getByRole("tab", { name: "Breads" }));
    expect(within(menu).getByText("Butter Naan")).toBeInTheDocument();
    expect(
      within(menu).queryByText("Hyderabadi Dum Chicken Biryani"),
    ).not.toBeInTheDocument();

    await user.click(within(menu).getByRole("tab", { name: "All" }));
    expect(
      within(menu).getByText("Hyderabadi Dum Chicken Biryani"),
    ).toBeInTheDocument();
  });

  it("searches by dish name and clears back to the full menu", async () => {
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
    expect(within(menu).getByText("Subz Dum Biryani")).toBeInTheDocument();
  });

  it("shows the empty state for a query with no matches", async () => {
    const user = userEvent.setup();
    render(<App />);

    const menu = screen.getByTestId("menu.section");
    await user.type(within(menu).getByLabelText("Search the menu"), "sushi");
    expect(within(menu).getByTestId("menu.empty_state")).toBeInTheDocument();
  });
});
