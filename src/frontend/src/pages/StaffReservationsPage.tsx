import type { Reservation } from "@/backend";
import { ReservationStatus } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  reservationErrorMessage,
  useCancelReservation,
  useConfirmReservation,
  useReservations,
} from "@/hooks/use-restaurant";
import { cn } from "@/lib/utils";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  CalendarDays,
  Check,
  Loader2,
  Lock,
  Mail,
  Phone,
  ShieldAlert,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: ReservationStatus.pending, label: "Pending" },
  { value: ReservationStatus.confirmed, label: "Confirmed" },
  { value: ReservationStatus.cancelled, label: "Cancelled" },
] as const;

const STATUS_META: Record<
  ReservationStatus,
  { label: string; className: string }
> = {
  [ReservationStatus.pending]: {
    label: "Pending",
    className: "border-warning/40 bg-warning/15 text-foreground",
  },
  [ReservationStatus.confirmed]: {
    label: "Confirmed",
    className: "border-success/40 bg-success/15 text-foreground",
  },
  [ReservationStatus.cancelled]: {
    label: "Cancelled",
    className: "border-destructive/40 bg-destructive/15 text-foreground",
  },
};

/** Render an ISO date as a friendly label, e.g. "Sat, 3 Oct 2026". */
function formatDateLabel(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Sort reservations by date then time slot, earliest first. */
function sortReservations(rows: Reservation[]): Reservation[] {
  return [...rows].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    return a.timeSlot.localeCompare(b.timeSlot);
  });
}

/** Staff-only reservation management: list, filter, confirm, and cancel. */
export default function StaffReservationsPage() {
  const { isAuthenticated, isInitializing, login, isLoggingIn } =
    useInternetIdentity();

  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const status =
    statusFilter === "all" ? null : (statusFilter as ReservationStatus);
  const {
    data: reservations,
    isLoading,
    isError,
    refetch,
  } = useReservations(dateFilter || null, status);

  const confirmReservation = useConfirmReservation();
  const cancelReservation = useCancelReservation();
  const [actionError, setActionError] = useState<string | null>(null);

  const rows = sortReservations(reservations ?? []);

  const handleConfirm = (id: bigint) => {
    setActionError(null);
    confirmReservation.mutate(id, {
      onSuccess: (result) => {
        if (result.__kind__ === "err") {
          setActionError(reservationErrorMessage(result.err));
        }
      },
      onError: () =>
        setActionError("We could not reach the kitchen. Please try again."),
    });
  };

  const handleCancel = (id: bigint) => {
    setActionError(null);
    cancelReservation.mutate(id, {
      onSuccess: (result) => {
        if (result.__kind__ === "err") {
          setActionError(reservationErrorMessage(result.err));
        }
      },
      onError: () =>
        setActionError("We could not reach the kitchen. Please try again."),
    });
  };

  if (isInitializing) {
    return (
      <div
        data-ocid="staff_reservations.loading_state"
        className="container flex min-h-[60vh] items-center justify-center py-20"
      >
        <Loader2
          className="h-6 w-6 animate-spin text-primary"
          aria-hidden="true"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container flex min-h-[70vh] items-center justify-center py-20">
        <div
          data-ocid="staff_reservations.signin_panel"
          className="w-full max-w-md rounded-lg border border-border bg-card p-8 text-center shadow-elevated"
        >
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-7 w-7 text-primary" aria-hidden="true" />
          </span>
          <h1 className="mt-5 font-display text-2xl font-semibold text-foreground">
            Staff sign-in required
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The reservation desk is reserved for DUM staff. Sign in to review
            and manage table bookings.
          </p>
          <Button
            type="button"
            data-ocid="staff_reservations.signin_button"
            onClick={() => login()}
            disabled={isLoggingIn}
            className="mt-6 w-full rounded-full bg-gradient-primary font-semibold text-primary-foreground shadow-subtle transition-smooth hover:shadow-elevated"
          >
            {isLoggingIn ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : null}
            {isLoggingIn ? "Signing in…" : "Sign in"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div data-ocid="staff_reservations.page" className="bg-background">
      <section className="border-b border-border bg-gradient-royal">
        <div className="container py-12 md:py-16">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
            Reservation desk
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold text-foreground md:text-4xl">
            Table reservations
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
            Every booking, sorted by date and time. Confirm pending tables or
            cancel a booking — the guest is notified by email either way.
          </p>
        </div>
      </section>

      <section className="container py-10">
        <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5 shadow-subtle md:flex-row md:items-end">
          <div className="flex flex-col gap-2 md:w-56">
            <Label htmlFor="staff-filter-date">Filter by date</Label>
            <Input
              id="staff-filter-date"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              data-ocid="staff_reservations.date_input"
            />
          </div>
          <div className="flex flex-col gap-2 md:w-56">
            <Label htmlFor="staff-filter-status">Filter by status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger
                id="staff-filter-status"
                data-ocid="staff_reservations.status_select"
                className="w-full"
              >
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {dateFilter ? (
            <Button
              type="button"
              variant="outline"
              data-ocid="staff_reservations.clear_filters_button"
              onClick={() => {
                setDateFilter("");
                setStatusFilter("all");
              }}
              className="rounded-full md:mb-0.5"
            >
              Clear filters
            </Button>
          ) : null}
        </div>

        {actionError ? (
          <p
            data-ocid="staff_reservations.error_state"
            className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {actionError}
          </p>
        ) : null}

        <div className="mt-6">
          {isLoading ? (
            <div
              data-ocid="staff_reservations.loading_state"
              className="flex flex-col gap-3"
            >
              {Array.from(
                { length: 5 },
                (_, i) => `reservation-skeleton-${i}`,
              ).map((id) => (
                <Skeleton key={id} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : isError ? (
            <div
              data-ocid="staff_reservations.error_state"
              className="rounded-lg border border-destructive/30 bg-destructive/10 p-8 text-center"
            >
              <ShieldAlert
                className="mx-auto h-8 w-8 text-destructive"
                aria-hidden="true"
              />
              <p className="mt-3 font-display text-lg font-semibold text-foreground">
                We could not load reservations
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Check your connection and try again.
              </p>
              <Button
                type="button"
                variant="outline"
                data-ocid="staff_reservations.retry_button"
                onClick={() => void refetch()}
                className="mt-4 rounded-full"
              >
                Try again
              </Button>
            </div>
          ) : rows.length === 0 ? (
            <div
              data-ocid="staff_reservations.empty_state"
              className="rounded-lg border border-dashed border-border bg-card p-12 text-center"
            >
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <CalendarDays
                  className="h-7 w-7 text-muted-foreground"
                  aria-hidden="true"
                />
              </span>
              <p className="mt-4 font-display text-lg font-semibold text-foreground">
                No reservations match these filters
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a different date or status, or clear the filters to see
                every booking.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border bg-card shadow-subtle">
              <Table data-ocid="staff_reservations.table">
                <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur">
                  <TableRow>
                    <TableHead className="px-4">Guest</TableHead>
                    <TableHead className="px-4">Date &amp; time</TableHead>
                    <TableHead className="px-4 text-right">Party</TableHead>
                    <TableHead className="px-4">Status</TableHead>
                    <TableHead className="px-4 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((reservation, index) => {
                    const meta = STATUS_META[reservation.status];
                    const isBusy =
                      (confirmReservation.isPending &&
                        confirmReservation.variables === reservation.id) ||
                      (cancelReservation.isPending &&
                        cancelReservation.variables === reservation.id);
                    return (
                      <TableRow
                        key={reservation.id.toString()}
                        data-ocid={`staff_reservations.row.${index + 1}`}
                      >
                        <TableCell className="px-4 py-4 align-top">
                          <div className="flex flex-col gap-1">
                            <span className="font-medium text-foreground">
                              {reservation.guestName}
                            </span>
                            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                              {reservation.reference}
                            </span>
                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Phone
                                className="h-3 w-3 shrink-0"
                                aria-hidden="true"
                              />
                              {reservation.phone}
                            </span>
                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Mail
                                className="h-3 w-3 shrink-0"
                                aria-hidden="true"
                              />
                              <span className="min-w-0 truncate">
                                {reservation.email}
                              </span>
                            </span>
                            {reservation.specialRequests ? (
                              <span className="mt-1 max-w-xs text-xs italic text-muted-foreground">
                                “{reservation.specialRequests}”
                              </span>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-4 align-top">
                          <div className="flex flex-col gap-1">
                            <span className="font-medium text-foreground">
                              {formatDateLabel(reservation.date)}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {reservation.timeSlot}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-4 text-right align-top">
                          <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                            <Users
                              className="h-3.5 w-3.5 text-muted-foreground"
                              aria-hidden="true"
                            />
                            {Number(reservation.partySize)}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-4 align-top">
                          <Badge
                            variant="outline"
                            className={cn(
                              "rounded-full font-medium",
                              meta.className,
                            )}
                          >
                            {meta.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-4 text-right align-top">
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              data-ocid={`staff_reservations.confirm_button.${index + 1}`}
                              disabled={
                                isBusy ||
                                reservation.status !== ReservationStatus.pending
                              }
                              onClick={() => handleConfirm(reservation.id)}
                              className="rounded-full border-success/40 text-success hover:bg-success/10"
                            >
                              {confirmReservation.isPending &&
                              confirmReservation.variables ===
                                reservation.id ? (
                                <Loader2
                                  className="h-4 w-4 animate-spin"
                                  aria-hidden="true"
                                />
                              ) : (
                                <Check className="h-4 w-4" aria-hidden="true" />
                              )}
                              Confirm
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              data-ocid={`staff_reservations.cancel_button.${index + 1}`}
                              disabled={
                                isBusy ||
                                reservation.status ===
                                  ReservationStatus.cancelled
                              }
                              onClick={() => handleCancel(reservation.id)}
                              className="rounded-full border-destructive/40 text-destructive hover:bg-destructive/10"
                            >
                              {cancelReservation.isPending &&
                              cancelReservation.variables === reservation.id ? (
                                <Loader2
                                  className="h-4 w-4 animate-spin"
                                  aria-hidden="true"
                                />
                              ) : (
                                <X className="h-4 w-4" aria-hidden="true" />
                              )}
                              Cancel
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
