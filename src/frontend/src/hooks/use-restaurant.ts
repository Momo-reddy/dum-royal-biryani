import { createActor } from "@/backend";
import type {
  MenuCategory,
  MenuItem,
  Photo,
  RatingBreakdown,
  Reservation,
  ReservationError,
  ReservationInput,
  RestaurantProfile,
  Review,
  TimeSlot,
} from "@/backend";
import type { ReservationStatus } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** Result union returned by the reservation write endpoints. */
export type ReservationResult =
  | { __kind__: "ok"; ok: Reservation }
  | { __kind__: "err"; err: ReservationError };

/** Human-readable message for every reservation failure variant. */
export function reservationErrorMessage(error: ReservationError): string {
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
    case "notFound":
      return "We could not find that reservation.";
    case "alreadyCancelled":
      return "That reservation has already been cancelled.";
    case "notAuthorized":
      return "You are not authorized to manage reservations.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export function useProfile() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<RestaurantProfile>({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.getProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCategories() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<MenuCategory[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMenuItems() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<MenuItem[]>({
    queryKey: ["menuItems"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMenuItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useReviews() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Review[]>({
    queryKey: ["reviews"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listReviews();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRatingBreakdown() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<RatingBreakdown[]>({
    queryKey: ["ratingBreakdown"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRatingBreakdown();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePhotos() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Photo[]>({
    queryKey: ["photos"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listPhotos();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Bookable time slots for a date (YYYY-MM-DD). Disabled until a date is set. */
export function useAvailableSlots(date: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<TimeSlot[]>({
    queryKey: ["availableSlots", date],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAvailableSlots(date);
    },
    enabled: !!actor && !isFetching && date.length > 0,
  });
}

/** Create a table reservation. No sign-in required. */
export function useCreateReservation() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<ReservationResult, Error, ReservationInput>({
    mutationFn: async (input: ReservationInput) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.createReservation(input);
    },
    onSuccess: (result) => {
      if (result.__kind__ === "ok") {
        void queryClient.invalidateQueries({
          queryKey: ["availableSlots", result.ok.date],
        });
      }
    },
  });
}

/**
 * Staff-only: list reservations, optionally filtered by date (YYYY-MM-DD) and
 * status. Pass `null` for either filter to leave it unset. The backend returns
 * an empty list for non-staff callers.
 */
export function useReservations(
  date: string | null,
  status: ReservationStatus | null,
) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Reservation[]>({
    queryKey: ["reservations", date, status],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listReservations(date, status);
    },
    enabled: !!actor && !isFetching,
  });
}

/** Staff-only: confirm a pending reservation and email the guest. */
export function useConfirmReservation() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<ReservationResult, Error, bigint>({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.confirmReservation(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["reservations"] });
    },
  });
}

/** Staff-only: cancel a reservation and email the guest. */
export function useCancelReservation() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<ReservationResult, Error, bigint>({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.cancelReservation(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["reservations"] });
    },
  });
}
