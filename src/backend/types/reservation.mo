module {
  /// Lifecycle of a table reservation.
  public type ReservationStatus = {
    #pending;
    #confirmed;
    #cancelled;
  };

  /// A confirmed-or-pending table booking.
  /// `reference` is the guest-facing booking reference (e.g. "DUM-4F2A9C").
  /// `date` is an ISO-8601 calendar date string (YYYY-MM-DD).
  /// `timeSlot` is a 24-hour "HH:MM" wall-clock slot within opening hours.
  /// `createdAt` is a nanosecond timestamp (Time.now()).
  public type Reservation = {
    id : Nat;
    reference : Text;
    guestName : Text;
    phone : Text;
    email : Text;
    partySize : Nat;
    date : Text;
    timeSlot : Text;
    specialRequests : ?Text;
    status : ReservationStatus;
    createdAt : Int;
  };

  /// Guest-supplied fields for creating a reservation. The backend assigns
  /// `id`, `reference`, `status`, and `createdAt`.
  public type ReservationInput = {
    guestName : Text;
    phone : Text;
    email : Text;
    partySize : Nat;
    date : Text;
    timeSlot : Text;
    specialRequests : ?Text;
  };

  /// Caller-actionable failure reasons for reservation operations.
  public type ReservationError = {
    #invalidInput : Text;
    #pastDate;
    #closedDay;
    #invalidTimeSlot;
    #slotUnavailable;
    #notFound;
    #alreadyCancelled;
    #notAuthorized;
  };

  /// A bookable time slot for a given date, with remaining capacity.
  public type TimeSlot = {
    time : Text;
    available : Bool;
  };
};
