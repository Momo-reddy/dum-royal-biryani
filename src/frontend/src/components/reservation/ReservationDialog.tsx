import type { Reservation, ReservationInput } from "@/backend";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import {
  reservationErrorMessage,
  useAvailableSlots,
  useCreateReservation,
} from "@/hooks/use-restaurant";
import { cn } from "@/lib/utils";
import {
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

interface ReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormState {
  guestName: string;
  phone: string;
  email: string;
  partySize: string;
  date: string;
  timeSlot: string;
  specialRequests: string;
}

type FieldErrors = Partial<Record<keyof FormState, string>>;

const EMPTY_FORM: FormState = {
  guestName: "",
  phone: "",
  email: "",
  partySize: "2",
  date: "",
  timeSlot: "",
  specialRequests: "",
};

const PARTY_SIZES = Array.from({ length: 12 }, (_, i) => String(i + 1));

/** Local calendar date as YYYY-MM-DD, avoiding UTC off-by-one. */
function todayIso(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

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

function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.guestName.trim()) errors.guestName = "Please enter your name.";
  if (!form.phone.trim()) {
    errors.phone = "Please enter a phone number.";
  } else if (form.phone.replace(/\D/g, "").length < 10) {
    errors.phone = "Enter a valid phone number with at least 10 digits.";
  }
  if (!form.email.trim()) {
    errors.email = "Please enter an email address.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (!form.partySize) errors.partySize = "Select a party size.";
  if (!form.date) {
    errors.date = "Please choose a date.";
  } else if (form.date < todayIso()) {
    errors.date = "That date has already passed. Choose today or later.";
  }
  if (!form.timeSlot) errors.timeSlot = "Please choose a time slot.";
  return errors;
}

/** Reservation booking dialog: collects guest details and confirms a booking. */
export function ReservationDialog({
  open,
  onOpenChange,
}: ReservationDialogProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [confirmation, setConfirmation] = useState<Reservation | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const createReservation = useCreateReservation();
  const {
    data: slots,
    isLoading: slotsLoading,
    isError: slotsError,
  } = useAvailableSlots(form.date);

  const availableSlots = useMemo(
    () => (slots ?? []).filter((slot) => slot.available),
    [slots],
  );

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setSubmitError(null);
  };

  const reset = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setConfirmation(null);
    setSubmitError(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const input: ReservationInput = {
      guestName: form.guestName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      partySize: BigInt(form.partySize),
      date: form.date,
      timeSlot: form.timeSlot,
      specialRequests: form.specialRequests.trim() || undefined,
    };

    createReservation.mutate(input, {
      onSuccess: (result) => {
        if (result.__kind__ === "ok") {
          setConfirmation(result.ok);
        } else {
          setSubmitError(reservationErrorMessage(result.err));
        }
      },
      onError: () => {
        setSubmitError("We could not reach the kitchen. Please try again.");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        data-ocid="reservation.dialog"
        className="max-h-[90vh] overflow-y-auto sm:max-w-xl"
      >
        {confirmation ? (
          <div data-ocid="reservation.success_state" className="flex flex-col">
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success/15">
                <CheckCircle2
                  className="h-7 w-7 text-success"
                  aria-hidden="true"
                />
              </span>
              <DialogTitle className="font-display text-2xl">
                Table reserved
              </DialogTitle>
              <DialogDescription>
                Thank you, {confirmation.guestName}. We have your table on hold
                — please keep your booking reference handy.
              </DialogDescription>
            </div>

            <div className="mt-6 rounded-lg border border-primary/30 bg-primary/5 p-5 text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                Booking reference
              </p>
              <p
                data-ocid="reservation.reference"
                className="mt-1 font-display text-2xl font-bold tracking-wide text-primary"
              >
                {confirmation.reference}
              </p>
            </div>

            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
              <DetailRow
                icon={<CalendarDays className="h-4 w-4" aria-hidden="true" />}
                label="Date"
                value={formatDateLabel(confirmation.date)}
              />
              <DetailRow
                icon={<Clock className="h-4 w-4" aria-hidden="true" />}
                label="Time"
                value={confirmation.timeSlot}
              />
              <DetailRow
                icon={<Users className="h-4 w-4" aria-hidden="true" />}
                label="Party size"
                value={`${Number(confirmation.partySize)} ${
                  Number(confirmation.partySize) === 1 ? "guest" : "guests"
                }`}
              />
              <DetailRow
                icon={<CalendarCheck className="h-4 w-4" aria-hidden="true" />}
                label="Status"
                value="Pending confirmation"
              />
            </dl>

            {confirmation.specialRequests ? (
              <p className="mt-4 rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Requests: </span>
                {confirmation.specialRequests}
              </p>
            ) : null}

            <Button
              type="button"
              data-ocid="reservation.close_button"
              onClick={() => handleOpenChange(false)}
              className="mt-6 w-full rounded-full bg-gradient-primary font-semibold text-primary-foreground shadow-subtle transition-smooth hover:shadow-elevated"
            >
              Done
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">
                Reserve a Table
              </DialogTitle>
              <DialogDescription>
                Tell us when you are coming and we will keep a table ready. No
                sign-in required.
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={handleSubmit}
              noValidate
              className="mt-2 flex flex-col gap-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  id="reservation-name"
                  label="Full name"
                  error={errors.guestName}
                >
                  <Input
                    id="reservation-name"
                    value={form.guestName}
                    onChange={(e) => update("guestName", e.target.value)}
                    placeholder="Ananya Rao"
                    autoComplete="name"
                    aria-invalid={!!errors.guestName}
                    data-ocid="reservation.name_input"
                  />
                </Field>

                <Field
                  id="reservation-phone"
                  label="Phone"
                  error={errors.phone}
                >
                  <Input
                    id="reservation-phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="099000 06552"
                    autoComplete="tel"
                    aria-invalid={!!errors.phone}
                    data-ocid="reservation.phone_input"
                  />
                </Field>
              </div>

              <Field id="reservation-email" label="Email" error={errors.email}>
                <Input
                  id="reservation-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  data-ocid="reservation.email_input"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field
                  id="reservation-party"
                  label="Party size"
                  error={errors.partySize}
                >
                  <Select
                    value={form.partySize}
                    onValueChange={(value) => update("partySize", value)}
                  >
                    <SelectTrigger
                      id="reservation-party"
                      data-ocid="reservation.party_select"
                      className="w-full"
                      aria-invalid={!!errors.partySize}
                    >
                      <SelectValue placeholder="Guests" />
                    </SelectTrigger>
                    <SelectContent>
                      {PARTY_SIZES.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size} {size === "1" ? "guest" : "guests"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field
                  id="reservation-date"
                  label="Date"
                  error={errors.date}
                  className="sm:col-span-2"
                >
                  <Input
                    id="reservation-date"
                    type="date"
                    min={todayIso()}
                    value={form.date}
                    onChange={(e) => {
                      update("date", e.target.value);
                      update("timeSlot", "");
                    }}
                    aria-invalid={!!errors.date}
                    data-ocid="reservation.date_input"
                  />
                </Field>
              </div>

              <Field
                id="reservation-slot"
                label="Time slot"
                error={errors.timeSlot}
              >
                {!form.date ? (
                  <p className="rounded-md border border-dashed border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                    Choose a date to see available times.
                  </p>
                ) : slotsLoading ? (
                  <div
                    data-ocid="reservation.slots_loading_state"
                    className="flex flex-wrap gap-2"
                  >
                    {Array.from(
                      { length: 6 },
                      (_, i) => `slot-skeleton-${i}`,
                    ).map((id) => (
                      <Skeleton key={id} className="h-9 w-20 rounded-full" />
                    ))}
                  </div>
                ) : slotsError ? (
                  <p
                    data-ocid="reservation.slots_error_state"
                    className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                  >
                    We could not load times for that date. Please try another
                    date.
                  </p>
                ) : availableSlots.length === 0 ? (
                  <p
                    data-ocid="reservation.slots_empty_state"
                    className="rounded-md border border-dashed border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground"
                  >
                    We are closed or fully booked on{" "}
                    {formatDateLabel(form.date)}. Please choose another date.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        data-ocid={`reservation.slot.${slot.time.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`}
                        aria-pressed={form.timeSlot === slot.time}
                        onClick={() => update("timeSlot", slot.time)}
                        className={cn(
                          "rounded-full border px-4 py-2 text-sm font-medium transition-smooth focus-ring",
                          form.timeSlot === slot.time
                            ? "border-primary bg-primary text-primary-foreground shadow-subtle"
                            : "border-border bg-card text-foreground hover:border-primary/40",
                        )}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
              </Field>

              <Field
                id="reservation-requests"
                label="Special requests (optional)"
              >
                <Textarea
                  id="reservation-requests"
                  value={form.specialRequests}
                  onChange={(e) => update("specialRequests", e.target.value)}
                  placeholder="Window table, high chair, birthday cake…"
                  rows={3}
                  data-ocid="reservation.requests_textarea"
                />
              </Field>

              {submitError ? (
                <p
                  data-ocid="reservation.error_state"
                  className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                >
                  {submitError}
                </p>
              ) : null}

              <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  data-ocid="reservation.cancel_button"
                  onClick={() => handleOpenChange(false)}
                  className="rounded-full"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createReservation.isPending}
                  data-ocid="reservation.submit_button"
                  className="rounded-full bg-gradient-primary font-semibold text-primary-foreground shadow-subtle transition-smooth hover:shadow-elevated"
                >
                  {createReservation.isPending ? (
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                  ) : null}
                  {createReservation.isPending
                    ? "Reserving…"
                    : "Confirm reservation"}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({
  id,
  label,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p
          data-ocid={`reservation.${id.replace("reservation-", "")}_error`}
          className="text-xs font-medium text-destructive"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-border bg-card px-4 py-3">
      <span className="mt-0.5 text-primary">{icon}</span>
      <div className="min-w-0">
        <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </dt>
        <dd className="truncate text-sm font-medium text-foreground">
          {value}
        </dd>
      </div>
    </div>
  );
}
