import AccessControl "mo:caffeineai-authorization/access-control";
import Map "mo:core/Map";

module {
  public type OldActor = {
    accessControlState : AccessControl.AccessControlState;
  };

  public type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    reservationState : {
      reservations : Map.Map<Nat, Reservation>;
      var nextId : Nat;
    };
  };

  public type ReservationStatus = {
    #pending;
    #confirmed;
    #cancelled;
  };

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

  public func migration(old : OldActor) : NewActor {
    {
      accessControlState = old.accessControlState;
      reservationState = {
        reservations = Map.empty();
        var nextId = 1;
      };
    };
  };
};
