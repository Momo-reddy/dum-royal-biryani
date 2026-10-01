/// OQL implicit instance: `?Text -> Value`.
/// An absent option collapses to the empty-string sentinel so the column keeps
/// a single, stable `#text` type across every row.

import Types "mo:caffeineai-oql/Types";

module {
  public func _toRow(self : ?Text) : Types.Value =
    switch self {
      case null { #text("") };
      case (?t) { #text(t) };
    };
};
