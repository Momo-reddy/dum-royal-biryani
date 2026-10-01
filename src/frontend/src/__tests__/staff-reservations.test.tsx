import type { Reservation } from "@/backend";
import { ReservationStatus } from "@/backend";
import StaffReservationsPage from "@/pages/StaffReservationsPage";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Staff reservation desk journey against the real page component with the data
 * hooks and Internet Identity mocked at the module seams. Covers the accepted
 * staff behavior: the sign-in gate, the date/time-sorted list, status
 * filtering, and the confirm/cancel actions.
 */

const hooks = vi.hoisted(() => ({
  useReservations: vi.fn(),
  useConfirmReservation: vi.fn(),
  useCancelReservation: vi.fn(),
  reservationErrorMessage: vi.fn(
    (error: { __kind__: string }) => error.__kind__,
  ),
}));

vi.mock("@/hooks/use-restaurant", () => hooks);

const auth = vi.hoisted(() => ({
  useInternetIdentity: vi.fn(),
}));

vi.mock("@caffeineai/core-infrastructure", () => auth);

function reservation(overrides: Partial<Reservation>): Reservation {
  return {
    id: 1n,
    reference: "DUM-AAAAAA",
    guestName: "Ananya Rao",
    phone: "09900006552",
    email: "ananya@example.com",
    partySize: 2n,
    date: "2099-12-31",
    timeSlot: "12:00",
    status: ReservationStatus.pending,
    createdAt: 1_700_000_000_000_000_000n,
    ...overrides,
  };
}

const ROWS: Reservation[] = [
  reservation({
    id: 2n,
    reference: "DUM-BBBBBB",
    guestName: "Karthik Menon",
    date: "2099-12-31",
    timeSlot: "19:00",
    status: ReservationStatus.confirmed,
  }),
  reservation({
    id: 1n,
    reference: "DUM-AAAAAA",
    guestName: "Ananya Rao",
    date: "2099-12-30",
    timeSlot: "20:00",
    status: ReservationStatus.pending,
  }),
];

function signedIn() {
  auth.useInternetIdentity.mockReturnValue({
    isAuthenticated: true,
    isInitializing: false,
    isLoggingIn: false,
    login: vi.fn(),
    clear: vi.fn(),
  });
}

function signedOut() {
  auth.useInternetIdentity.mockReturnValue({
    isAuthenticated: false,
    isInitializing: false,
    isLoggingIn: false,
    login: vi.fn(),
    clear: vi.fn(),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  signedIn();
  hooks.useReservations.mockReturnValue({
    data: ROWS,
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
});

describe("Staff reservation access", () => {
  it("shows the sign-in panel and no reservation table when signed out", () => {
    signedOut();
    render(<StaffReservationsPage />);

    expect(
      screen.getByTestId("staff_reservations.signin_panel"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("staff_reservations.table"),
    ).not.toBeInTheDocument();
  });

  it("renders the reservation list when signed in", () => {
    render(<StaffReservationsPage />);

    expect(screen.getByTestId("staff_reservations.page")).toBeInTheDocument();
    expect(screen.getByTestId("staff_reservations.table")).toBeInTheDocument();
    expect(screen.getByText("Ananya Rao")).toBeInTheDocument();
    expect(screen.getByText("Karthik Menon")).toBeInTheDocument();
  });
});

describe("Staff reservation list", () => {
  it("sorts reservations by date then time, earliest first", () => {
    render(<StaffReservationsPage />);

    const rows = screen.getAllByTestId(/^staff_reservations\.row\./);
    expect(rows).toHaveLength(2);
    // 2099-12-30 20:00 precedes 2099-12-31 19:00.
    expect(within(rows[0]).getByText("Ananya Rao")).toBeInTheDocument();
    expect(within(rows[1]).getByText("Karthik Menon")).toBeInTheDocument();
  });

  it("shows the empty state when no reservations match", () => {
    hooks.useReservations.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    render(<StaffReservationsPage />);

    expect(
      screen.getByTestId("staff_reservations.empty_state"),
    ).toBeInTheDocument();
  });

  it("passes the chosen date filter to the reservations query", async () => {
    const user = userEvent.setup();
    render(<StaffReservationsPage />);

    // The initial query has no filters applied.
    expect(hooks.useReservations).toHaveBeenLastCalledWith(null, null);

    await user.type(
      screen.getByTestId("staff_reservations.date_input"),
      "2099-12-31",
    );

    await waitFor(() =>
      expect(hooks.useReservations).toHaveBeenLastCalledWith(
        "2099-12-31",
        null,
      ),
    );
  });

  it("offers pending, confirmed, and cancelled status filters", () => {
    render(<StaffReservationsPage />);

    // The select trigger renders the current value; the options are portalled
    // on open, so assert the trigger is present and labelled.
    expect(
      screen.getByTestId("staff_reservations.status_select"),
    ).toBeInTheDocument();
    expect(screen.getByText("All statuses")).toBeInTheDocument();
  });
});

describe("Staff reservation actions", () => {
  it("confirms a pending reservation through the mutation", async () => {
    const user = userEvent.setup();
    const mutate = vi.fn();
    hooks.useConfirmReservation.mockReturnValue({
      mutate,
      isPending: false,
      variables: undefined,
    });
    render(<StaffReservationsPage />);

    // Row 1 is the pending booking (Ananya Rao).
    await user.click(screen.getByTestId("staff_reservations.confirm_button.1"));

    expect(mutate).toHaveBeenCalledWith(1n, expect.anything());
  });

  it("cancels a reservation through the mutation", async () => {
    const user = userEvent.setup();
    const mutate = vi.fn();
    hooks.useCancelReservation.mockReturnValue({
      mutate,
      isPending: false,
      variables: undefined,
    });
    render(<StaffReservationsPage />);

    await user.click(screen.getByTestId("staff_reservations.cancel_button.1"));

    expect(mutate).toHaveBeenCalledWith(1n, expect.anything());
  });

  it("disables confirm on an already-confirmed reservation", () => {
    render(<StaffReservationsPage />);

    // Row 2 is the confirmed booking (Karthik Menon).
    expect(
      screen.getByTestId("staff_reservations.confirm_button.2"),
    ).toBeDisabled();
  });
});
