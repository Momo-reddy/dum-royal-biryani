/** Formatting helpers shared across the restaurant site. */

/** Format a whole-rupee amount with Indian digit grouping, e.g. 1250 -> "₹1,250". */
export function formatRupees(amount: bigint | number): string {
  const value = typeof amount === "bigint" ? Number(amount) : amount;
  return `₹${value.toLocaleString("en-IN")}`;
}

/** Format a rating number to one decimal place, e.g. 4.6 -> "4.6". */
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

/** Format a review count with Indian digit grouping, e.g. 1024 -> "1,024". */
export function formatCount(count: bigint | number): string {
  const value = typeof count === "bigint" ? Number(count) : count;
  return value.toLocaleString("en-IN");
}

/** Full street address assembled from profile parts. */
export function formatAddress(parts: {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
}): string {
  return [
    parts.addressLine1,
    parts.addressLine2,
    parts.city,
    `${parts.state} ${parts.postalCode}`,
  ]
    .filter((part) => part.trim().length > 0)
    .join(", ");
}

/** Google Maps directions URL for a free-text address. */
export function directionsUrl(address: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

/** Google Maps embed URL for a free-text address (no API key required). */
export function mapEmbedUrl(address: string): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
}

/** tel: href from a display phone number, stripping spaces and punctuation. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/**
 * Derive the live open/closed state from a closing time string such as "2 am".
 * The restaurant opens at 11:00 and closes at the parsed hour (after midnight
 * when the hour is in the early morning).
 */
export function getOpenState(
  closingTime: string,
  now: Date = new Date(),
): { isOpen: boolean; label: string } {
  const match = closingTime.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  let closeHour = 2;
  if (match) {
    let hour = Number(match[1]);
    const meridiem = match[3]?.toLowerCase();
    if (meridiem === "pm" && hour < 12) hour += 12;
    if (meridiem === "am" && hour === 12) hour = 0;
    closeHour = hour;
  }
  const openHour = 11;
  const current = now.getHours() + now.getMinutes() / 60;
  const isOpen = current >= openHour || current < closeHour;
  return {
    isOpen,
    label: isOpen ? `Open now · Closes ${closingTime}` : "Closed · Opens 11 am",
  };
}
