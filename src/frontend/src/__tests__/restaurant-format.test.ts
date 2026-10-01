import {
  directionsUrl,
  formatAddress,
  formatCount,
  formatRating,
  formatRupees,
  getOpenState,
  mapEmbedUrl,
  telHref,
} from "@/lib/restaurant-format";
import { describe, expect, it } from "vitest";

describe("restaurant-format", () => {
  it("formats rupee amounts with Indian digit grouping", () => {
    expect(formatRupees(400n)).toBe("₹400");
    expect(formatRupees(1600n)).toBe("₹1,600");
    expect(formatRupees(1250)).toBe("₹1,250");
  });

  it("formats ratings to one decimal and counts with grouping", () => {
    expect(formatRating(4.6)).toBe("4.6");
    expect(formatRating(5)).toBe("5.0");
    expect(formatCount(1024n)).toBe("1,024");
  });

  it("assembles the full address and drops empty parts", () => {
    expect(
      formatAddress({
        addressLine1: "35, 80 Feet Rd, HAL 3rd Stage",
        addressLine2: "Indiranagar",
        city: "Bengaluru",
        state: "Karnataka",
        postalCode: "560075",
      }),
    ).toBe(
      "35, 80 Feet Rd, HAL 3rd Stage, Indiranagar, Bengaluru, Karnataka 560075",
    );

    expect(
      formatAddress({
        addressLine1: "35, 80 Feet Rd",
        addressLine2: "",
        city: "Bengaluru",
        state: "Karnataka",
        postalCode: "560075",
      }),
    ).toBe("35, 80 Feet Rd, Bengaluru, Karnataka 560075");
  });

  it("builds directions and map URLs from the address", () => {
    const address = "35, 80 Feet Rd, Indiranagar, Bengaluru";
    expect(directionsUrl(address)).toBe(
      `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`,
    );
    expect(mapEmbedUrl(address)).toBe(
      `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`,
    );
  });

  it("derives a tel: href from the display phone number", () => {
    expect(telHref("099000 06552")).toBe("tel:09900006552");
  });

  it("reports open during service hours and closed in the early morning", () => {
    const open = getOpenState("2 am", new Date(2026, 0, 1, 20, 0));
    expect(open.isOpen).toBe(true);
    expect(open.label).toBe("Open now · Closes 2 am");

    const closed = getOpenState("2 am", new Date(2026, 0, 1, 5, 0));
    expect(closed.isOpen).toBe(false);
    expect(closed.label).toBe("Closed · Opens 11 am");
  });
});
