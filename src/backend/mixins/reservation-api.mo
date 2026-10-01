import AccessControl "mo:caffeineai-authorization/access-control";
import EmailClient "mo:caffeineai-email/emailClient";
import Principal "mo:core/Principal";
import Types "../types/reservation";
import ReservationLib "../lib/reservation";

mixin (
  state : ReservationLib.State,
  accessControlState : AccessControl.AccessControlState,
) {
  /// True when the caller holds a staff role (admin or user). Unregistered and
  /// anonymous callers are not staff. Reads the role map directly so an
  /// unregistered caller is rejected rather than trapped.
  func isStaff(caller : Principal) : Bool {
    if (caller.isAnonymous()) { return false };
    switch (accessControlState.userRoles.get(caller)) {
      case null { false };
      case (?role) {
        switch (role) {
          case (#admin) { true };
          case (#user) { true };
          case (#guest) { false };
        };
      };
    };
  };

  /// Sends a status notification to the guest. Failures are swallowed: the
  /// reservation state change has already been committed and must not be
  /// rolled back because the mail gateway is unavailable.
  func notifyGuest(reservation : Types.Reservation, subject : Text, body : Text) : async () {
    ignore await EmailClient.sendServiceEmail(
      "no-reply",
      [reservation.email],
      subject,
      body,
    );
  };

  /// Public: create a table reservation. No sign-in required.
  public shared func createReservation(
    input : Types.ReservationInput,
  ) : async { #ok : Types.Reservation; #err : Types.ReservationError } {
    ReservationLib.create(state, input);
  };

  /// Public: list bookable time slots for a date (YYYY-MM-DD).
  public query func listAvailableSlots(date : Text) : async [Types.TimeSlot] {
    ReservationLib.availableSlots(state, date);
  };

  /// Staff-only: list reservations, optionally filtered by date and status.
  public query ({ caller }) func listReservations(
    date : ?Text,
    status : ?Types.ReservationStatus,
  ) : async [Types.Reservation] {
    if (not isStaff(caller)) {
      return [];
    };
    ReservationLib.listFiltered(state, date, status);
  };

  /// Staff-only: confirm a pending reservation and email the guest.
  public shared ({ caller }) func confirmReservation(
    id : Nat,
  ) : async { #ok : Types.Reservation; #err : Types.ReservationError } {
    if (not isStaff(caller)) {
      return #err(#notAuthorized);
    };
    switch (ReservationLib.confirm(state, id)) {
      case (#err(error)) { #err(error) };
      case (#ok(reservation)) {
        await notifyGuest(
          reservation,
          "Your reservation at DUM | The Royal Biryani Kitchen is confirmed",
          "Hello " # reservation.guestName # ",\n\n" #
          "Your table is confirmed.\n\n" #
          "Booking reference: " # reservation.reference # "\n" #
          "Date: " # reservation.date # "\n" #
          "Time: " # reservation.timeSlot # "\n" #
          "Party size: " # reservation.partySize.toText() # "\n\n" #
          "We look forward to hosting you.\n" #
          "DUM | The Royal Biryani Kitchen",
        );
        #ok(reservation);
      };
    };
  };

  /// Staff-only: cancel a reservation and email the guest.
  public shared ({ caller }) func cancelReservation(
    id : Nat,
  ) : async { #ok : Types.Reservation; #err : Types.ReservationError } {
    if (not isStaff(caller)) {
      return #err(#notAuthorized);
    };
    switch (ReservationLib.cancel(state, id)) {
      case (#err(error)) { #err(error) };
      case (#ok(reservation)) {
        await notifyGuest(
          reservation,
          "Your reservation at DUM | The Royal Biryani Kitchen is cancelled",
          "Hello " # reservation.guestName # ",\n\n" #
          "Your reservation has been cancelled.\n\n" #
          "Booking reference: " # reservation.reference # "\n" #
          "Date: " # reservation.date # "\n" #
          "Time: " # reservation.timeSlot # "\n\n" #
          "If this was a mistake, please call us on 099000 06552.\n" #
          "DUM | The Royal Biryani Kitchen",
        );
        #ok(reservation);
      };
    };
  };
};
