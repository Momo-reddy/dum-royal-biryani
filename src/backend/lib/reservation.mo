import Array "mo:core/Array";
import Int "mo:core/Int";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Types "../types/reservation";

module {
  /// Mutable reservation state shared with the actor: the reservation store and
  /// the monotonic id counter.
  public type State = {
    reservations : Map.Map<Nat, Types.Reservation>;
    var nextId : Nat;
  };

  /// Opening hours: the restaurant serves daily from 11:30 to 02:00 (next day).
  /// Slots are 30 minutes apart; the last seating is 90 minutes before close.
  let openHour : Nat = 11;
  let openMinute : Nat = 30;
  let closeHour : Nat = 2; // 02:00 next day
  let closeMinute : Nat = 0;
  let slotMinutes : Nat = 30;
  let lastSeatingLeadMinutes : Nat = 90;

  /// Maximum guests per slot before the slot is reported unavailable.
  let slotCapacity : Nat = 20;

  /// The restaurant is open every day of the week.
  let closedWeekdays : [Nat] = [];

  func pad2(n : Nat) : Text {
    if (n < 10) { "0" # n.toText() } else { n.toText() };
  };

  func formatSlot(minutesFromMidnight : Nat) : Text {
    pad2(minutesFromMidnight / 60) # ":" # pad2(minutesFromMidnight % 60);
  };

  /// Parses a YYYY-MM-DD date into (year, month, day). Returns null when the
  /// text is not a well-formed calendar date.
  func parseDate(date : Text) : ?(Nat, Nat, Nat) {
    let parts = date.split(#char '-').toArray();
    if (parts.size() != 3) { return null };
    let ?year = parts[0].toNat() else return null;
    let ?month = parts[1].toNat() else return null;
    let ?day = parts[2].toNat() else return null;
    if (year < 1970 or month < 1 or month > 12 or day < 1 or day > 31) {
      return null;
    };
    ?(year, month, day);
  };

  /// Days since the Unix epoch for a proleptic Gregorian date. Used only for
  /// ordering and weekday arithmetic, so the exact epoch convention is
  /// irrelevant as long as it is consistent.
  func daysFromCivil(year : Nat, month : Nat, day : Nat) : Int {
    let y : Int = if (month <= 2) { year.toInt() - 1 } else { year.toInt() };
    let era : Int = (if (y >= 0) { y } else { y - 399 }) / 400;
    let yoe : Int = y - era * 400;
    let mp : Int = (month.toInt() + 9) % 12;
    let doy : Int = (153 * mp + 2) / 5 + day.toInt() - 1;
    let doe : Int = yoe * 365 + yoe / 4 - yoe / 100 + doy;
    era * 146097 + doe - 719468;
  };

  /// Weekday for a date, 0 = Sunday .. 6 = Saturday.
  func weekday(year : Nat, month : Nat, day : Nat) : Nat {
    let days = daysFromCivil(year, month, day);
    let wd = (days + 4) % 7; // 1970-01-01 was a Thursday
    if (wd < 0) { (wd + 7).toNat() } else { wd.toNat() };
  };

  /// Today's date as (year, month, day), derived from the canister clock.
  func today() : (Nat, Nat, Nat) {
    let days = Time.now() / 86_400_000_000_000;
    let z = days + 719468;
    let era = (if (z >= 0) { z } else { z - 146096 }) / 146097;
    let doe = z - era * 146097;
    let yoe = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
    let y = yoe + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = doy - (153 * mp + 2) / 5 + 1;
    let m = if (mp < 10) { mp + 3 } else { mp - 9 };
    let year = if (m <= 2) { y + 1 } else { y };
    (year.toNat(), m.toNat(), d.toNat());
  };

  /// True when `date` (YYYY-MM-DD) is strictly before today.
  func isPastDate(date : Text) : Bool {
    switch (parseDate(date)) {
      case null { false };
      case (?(year, month, day)) {
        let (ty, tm, td) = today();
        daysFromCivil(year, month, day) < daysFromCivil(ty, tm, td);
      };
    };
  };

  /// Returns the opening-hours time slots for a calendar date (YYYY-MM-DD).
  /// Returns an empty array for a closed day or a malformed date.
  public func slotsForDate(date : Text) : [Text] {
    switch (parseDate(date)) {
      case null { [] };
      case (?(year, month, day)) {
        if (closedWeekdays.contains(weekday(year, month, day))) {
          return [];
        };
        let openMinutes = openHour * 60 + openMinute;
        let closeMinutes = closeHour * 60 + closeMinute + 24 * 60; // next day
        let lastSeating = closeMinutes - lastSeatingLeadMinutes;
        let slots = Array.tabulate(
          (lastSeating - openMinutes) / slotMinutes + 1,
          func(i) = formatSlot(openMinutes + i * slotMinutes),
        );
        slots;
      };
    };
  };

  /// Counts guests already booked into a given date and slot, ignoring
  /// cancelled reservations.
  func bookedGuests(state : State, date : Text, timeSlot : Text) : Nat {
    var total = 0;
    for (reservation in state.reservations.values()) {
      if (
        reservation.date == date and
        reservation.timeSlot == timeSlot and
        reservation.status != #cancelled
      ) {
        total += reservation.partySize;
      };
    };
    total;
  };

  /// Validates a reservation request against opening hours and availability.
  /// Returns the normalized input on success, or a caller-actionable error.
  public func validate(
    state : State,
    input : Types.ReservationInput,
  ) : { #ok : Types.ReservationInput; #err : Types.ReservationError } {
    let guestName = input.guestName.trim(#predicate(func(c) = c == ' '));
    if (guestName == "") {
      return #err(#invalidInput("Please enter your name."));
    };
    if (input.phone.trim(#predicate(func(c) = c == ' ')) == "") {
      return #err(#invalidInput("Please enter a phone number."));
    };
    let email = input.email.trim(#predicate(func(c) = c == ' '));
    if (email == "" or not email.contains(#char '@')) {
      return #err(#invalidInput("Please enter a valid email address."));
    };
    if (input.partySize == 0) {
      return #err(#invalidInput("Party size must be at least 1."));
    };
    if (input.partySize > slotCapacity) {
      return #err(#invalidInput("For parties larger than " # slotCapacity.toText() # ", please call the restaurant."));
    };
    switch (parseDate(input.date)) {
      case null {
        return #err(#invalidInput("Please choose a valid date."));
      };
      case (_) {};
    };
    if (isPastDate(input.date)) {
      return #err(#pastDate);
    };
    let slots = slotsForDate(input.date);
    if (slots.size() == 0) {
      return #err(#closedDay);
    };
    if (not slots.contains(input.timeSlot)) {
      return #err(#invalidTimeSlot);
    };
    if (bookedGuests(state, input.date, input.timeSlot) + input.partySize > slotCapacity) {
      return #err(#slotUnavailable);
    };
    #ok({
      guestName;
      phone = input.phone.trim(#predicate(func(c) = c == ' '));
      email;
      partySize = input.partySize;
      date = input.date;
      timeSlot = input.timeSlot;
      specialRequests = input.specialRequests;
    });
  };

  /// Builds a short, human-readable booking reference from an id.
  func makeReference(id : Nat) : Text {
    let alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let chars = alphabet.toArray();
    var n = id;
    var out = "";
    var i = 0;
    while (i < 6) {
      out := Text.fromChar(chars[n % chars.size()]) # out;
      n := n / chars.size();
      i += 1;
    };
    "DUM-" # out;
  };

  /// Creates a reservation, assigning id, reference, status, and createdAt.
  public func create(
    state : State,
    input : Types.ReservationInput,
  ) : { #ok : Types.Reservation; #err : Types.ReservationError } {
    switch (validate(state, input)) {
      case (#err(error)) { #err(error) };
      case (#ok(normalized)) {
        let id = state.nextId;
        state.nextId := id + 1;
        let reservation : Types.Reservation = {
          id;
          reference = makeReference(id);
          guestName = normalized.guestName;
          phone = normalized.phone;
          email = normalized.email;
          partySize = normalized.partySize;
          date = normalized.date;
          timeSlot = normalized.timeSlot;
          specialRequests = normalized.specialRequests;
          status = #pending;
          createdAt = Time.now();
        };
        state.reservations.add(id, reservation);
        #ok(reservation);
      };
    };
  };

  /// Orders reservations by date, then time slot, then id.
  func compareReservations(a : Types.Reservation, b : Types.Reservation) : { #less; #equal; #greater } {
    let byDate = Text.compare(a.date, b.date);
    if (byDate != #equal) { return byDate };
    let bySlot = Text.compare(a.timeSlot, b.timeSlot);
    if (bySlot != #equal) { return bySlot };
    Nat.compare(a.id, b.id);
  };

  /// Returns all reservations sorted by date then time slot.
  public func list(state : State) : [Types.Reservation] {
    state.reservations.values().toArray().sort(compareReservations);
  };

  /// Returns reservations filtered by optional date and optional status.
  public func listFiltered(
    state : State,
    date : ?Text,
    status : ?Types.ReservationStatus,
  ) : [Types.Reservation] {
    let all = list(state);
    all.filter(
      func(reservation) {
        let dateOk = switch (date) {
          case null { true };
          case (?d) { reservation.date == d };
        };
        let statusOk = switch (status) {
          case null { true };
          case (?s) { reservation.status == s };
        };
        dateOk and statusOk;
      }
    );
  };

  /// Returns a single reservation by id.
  public func get(state : State, id : Nat) : ?Types.Reservation {
    state.reservations.get(id);
  };

  /// Confirms a pending reservation.
  public func confirm(
    state : State,
    id : Nat,
  ) : { #ok : Types.Reservation; #err : Types.ReservationError } {
    switch (state.reservations.get(id)) {
      case null { #err(#notFound) };
      case (?reservation) {
        switch (reservation.status) {
          case (#cancelled) { #err(#alreadyCancelled) };
          case (#confirmed) { #ok(reservation) };
          case (#pending) {
            let updated : Types.Reservation = { reservation with status = #confirmed };
            state.reservations.add(id, updated);
            #ok(updated);
          };
        };
      };
    };
  };

  /// Cancels a pending or confirmed reservation.
  public func cancel(
    state : State,
    id : Nat,
  ) : { #ok : Types.Reservation; #err : Types.ReservationError } {
    switch (state.reservations.get(id)) {
      case null { #err(#notFound) };
      case (?reservation) {
        switch (reservation.status) {
          case (#cancelled) { #err(#alreadyCancelled) };
          case (_) {
            let updated : Types.Reservation = { reservation with status = #cancelled };
            state.reservations.add(id, updated);
            #ok(updated);
          };
        };
      };
    };
  };

  /// Returns the bookable slots for a date with availability flags.
  public func availableSlots(state : State, date : Text) : [Types.TimeSlot] {
    slotsForDate(date).map(
      func(slot) = {
        time = slot;
        available = bookedGuests(state, date, slot) < slotCapacity;
      }
    );
  };
};
