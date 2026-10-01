import type {
  Reservation,
  ReservationError,
  ReservationInput,
  TimeSlot,
} from "@/backend";
import { ReservationStatus } from "@/backend";
import { ReservationDialog } from "@/components/reservation/ReservationDialog";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Reservation booking journey against the real dialog component with the data
 * hooks mocked at the module seam. Covers the accepted guest-facing behavior:
 * required-field validation, opening-hours slot selection, the confirmation
 * with a booking reference, and the clear message for a closed day.
 */

const hooks = vi.hoisted(() => ({
  useAvailableSlots: vi.fn(),
  useCreateReservation: vi.fn(),
  reservationErrorMessage: vi.fn((error: ReservationError) => {
    switch (error.__kind__) {
      case "invalidInput":
        return error.invalidInput;
      case "pastDate":
        return "That date has already passed. Please choose today or a future date.";
      case "closedDay":
        return "We are closed on that day. Please pick another date.";
      case "invalidTimeSlot":
        return "That time slot is not offered. Please choose another time.";
      case "slotUnavailable":
        return "That time slot is fully booked. Please choose another time.";
      default:
        return "Something went wrong. Please try again.";
    }
  }),
}));

vi.mock("@/hooks/use-restaurant", () => hooks);

const OPEN_SLOTS: TimeSlot[] = [
  { time: "11:30", available: true },
  { time: "12:00", available: true },
  { time: "12:30", available: false },
];

const CONFIRMED: Reservation = {
  id: 7n,
  reference: "DUM-4F2A9C",
  guestName: "Ananya Rao",
  phone: "09900006552",
  email: "ananya@example.com",
  partySize: 4n,
  date: "2099-12-31",
  timeSlot: "12:00",
  specialRequests: "Window table",
  status: ReservationStatus.pending,
  createdAt: 1_700_000_000_000_000_000n,
};

/** A future ISO date, so the dialog's own past-date guard never trips. */
function futureIso(daysAhead = 30): string {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function renderDialog() {
  const onOpenChange = vi.fn();
  render(<ReservationDialog open onOpenChange={onOpenChange} />);
  return { onOpenChange };
}

beforeEach(() => {
  vi.clearAllMocks();
  hooks.useAvailableSlots.mockReturnValue({
    data: OPEN_SLOTS,
    isLoading: false,
    isError: false,
  });
  hooks.useCreateReservation.mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
  });
});

describe("Reservation form validation", () => {
  it("shows inline errors for missing required fields and does not submit", async () => {
    const user = userEvent.setup();
    const mutate = vi.fn();
    hooks.useCreateReservation.mockReturnValue({ mutate, isPending: false });
    renderDialog();

    await user.click(screen.getByTestId("reservation.submit_button"));

    expect(
      await screen.findByText("Please enter your name."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Please enter a phone number."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Please enter an email address."),
    ).toBeInTheDocument();
    expect(screen.getByText("Please choose a date.")).toBeInTheDocument();
    expect(screen.getByText("Please choose a time slot.")).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it("rejects a malformed email before submitting", async () => {
    const user = userEvent.setup();
    const mutate = vi.fn();
    hooks.useCreateReservation.mockReturnValue({ mutate, isPending: false });
    renderDialog();

    await user.type(screen.getByTestId("reservation.name_input"), "Ananya Rao");
    await user.type(
      screen.getByTestId("reservation.phone_input"),
      "09900006552",
    );
    await user.type(
      screen.getByTestId("reservation.email_input"),
      "not-an-email",
    );
    await user.click(screen.getByTestId("reservation.submit_button"));

    expect(
      await screen.findByText("Enter a valid email address."),
    ).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });
});

describe("Reservation time slots", () => {
  it("prompts for a date before offering times", () => {
    renderDialog();

    expect(
      screen.getByText("Choose a date to see available times."),
    ).toBeInTheDocument();
  });

  it("offers only the available slots for the chosen date", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.type(screen.getByTestId("reservation.date_input"), futureIso());

    expect(
      await screen.findByTestId("reservation.slot.11-30"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("reservation.slot.12-00")).toBeInTheDocument();
    // The fully booked slot is filtered out of the offered times.
    expect(
      screen.queryByTestId("reservation.slot.12-30"),
    ).not.toBeInTheDocument();
  });

  it("shows a clear closed-day message when no slots are available", async () => {
    const user = userEvent.setup();
    hooks.useAvailableSlots.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });
    renderDialog();

    await user.type(screen.getByTestId("reservation.date_input"), futureIso());

    const empty = await screen.findByTestId("reservation.slots_empty_state");
    expect(empty).toHaveTextContent(/closed or fully booked/i);
  });
});

describe("Reservation confirmation", () => {
  it("submits the guest details and shows a confirmation with a booking reference", async () => {
    const user = userEvent.setup();
    const mutate = vi.fn(
      (
        _input: ReservationInput,
        options?: { onSuccess?: (r: unknown) => void },
      ) => {
        options?.onSuccess?.({ __kind__: "ok", ok: CONFIRMED });
      },
    );
    hooks.useCreateReservation.mockReturnValue({ mutate, isPending: false });
    renderDialog();

    await user.type(screen.getByTestId("reservation.name_input"), "Ananya Rao");
    await user.type(
      screen.getByTestId("reservation.phone_input"),
      "09900006552",
    );
    await user.type(
      screen.getByTestId("reservation.email_input"),
      "ananya@example.com",
    );
    await user.type(screen.getByTestId("reservation.date_input"), futureIso());
    await user.click(await screen.findByTestId("reservation.slot.12-00"));
    await user.type(
      screen.getByTestId("reservation.requests_textarea"),
      "Window table",
    );
    await user.click(screen.getByTestId("reservation.submit_button"));

    await waitFor(() => expect(mutate).toHaveBeenCalledTimes(1));
    const [input] = mutate.mock.calls[0];
    expect(input).toMatchObject({
      guestName: "Ananya Rao",
      phone: "09900006552",
      email: "ananya@example.com",
      partySize: 2n,
      timeSlot: "12:00",
      specialRequests: "Window table",
    });

    const success = await screen.findByTestId("reservation.success_state");
    expect(
      within(success).getByTestId("reservation.reference"),
    ).toHaveTextContent("DUM-4F2A9C");
    expect(within(success).getByText("Table reserved")).toBeInTheDocument();
    expect(within(success).getByText("12:00")).toBeInTheDocument();
  });

  it("surfaces a backend closed-day rejection as a clear message", async () => {
    const user = userEvent.setup();
    const mutate = vi.fn(
      (
        _input: ReservationInput,
        options?: { onSuccess?: (r: unknown) => void },
      ) => {
        options?.onSuccess?.({
          __kind__: "err",
          err: { __kind__: "closedDay", closedDay: null },
        });
      },
    );
    hooks.useCreateReservation.mockReturnValue({ mutate, isPending: false });
    renderDialog();

    await user.type(screen.getByTestId("reservation.name_input"), "Ananya Rao");
    await user.type(
      screen.getByTestId("reservation.phone_input"),
      "09900006552",
    );
    await user.type(
      screen.getByTestId("reservation.email_input"),
      "ananya@example.com",
    );
    await user.type(screen.getByTestId("reservation.date_input"), futureIso());
    await user.click(await screen.findByTestId("reservation.slot.12-00"));
    await user.click(screen.getByTestId("reservation.submit_button"));

    const error = await screen.findByTestId("reservation.error_state");
    expect(error).toHaveTextContent(/closed on that day/i);
    expect(
      screen.queryByTestId("reservation.success_state"),
    ).not.toBeInTheDocument();
  });
});
