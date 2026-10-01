/// OQL implicit instance: `ReservationStatus -> Value`.
/// The variant collapses to its tag text so the column is queryable by status.

import Types "mo:caffeineai-oql/Types";
import ReservationTypes "reservation";

module {
  public func _toRow(self : ReservationTypes.ReservationStatus) : Types.Value =
    #text(
      switch self {
        case (#pending) { "pending" };
        case (#confirmed) { "confirmed" };
        case (#cancelled) { "cancelled" };
      }
    );
};
