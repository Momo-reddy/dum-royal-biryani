import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import Expose "mo:caffeineai-oql/Expose";
import Entity "mo:caffeineai-oql/Entity";
import ArrayEntity "mo:caffeineai-oql/ArrayEntity";
import MapEntity "mo:caffeineai-oql/MapEntity";
import RecordValue "mo:caffeineai-oql/RecordValue";
import NatValue "mo:caffeineai-oql/NatValue";
import IntValue "mo:caffeineai-oql/IntValue";
import TextValue "mo:caffeineai-oql/TextValue";
import BoolValue "mo:caffeineai-oql/BoolValue";
import FloatValue "mo:caffeineai-oql/FloatValue";
import OptTextValue "types/OptTextValue";
import ReservationStatusValue "types/ReservationStatusValue";
import Types "types/restaurant";
import ReservationTypes "types/reservation";
import RestaurantLib "lib/restaurant";
import ReservationLib "lib/reservation";
import RestaurantApi "mixins/restaurant-api";
import ReservationApi "mixins/reservation-api";
import ApiDocMixin "mixins/api-doc";

actor {
  let accessControlState : AccessControl.AccessControlState;
  let reservationState : ReservationLib.State;
  include MixinAuthorization(accessControlState, null);
  include Expose({
    entities = [
      RestaurantLib.allCategories().toEntity<Types.MenuCategory>("category", "MenuCategory", "id")
        .sample({ id = 0; name = ""; description = ""; order = 0 })
        .public_()
        .build(),
      RestaurantLib.allMenuItems().toEntity<Types.MenuItem>("menuItem", "MenuItem", "id")
        .sample({
          id = 0;
          categoryId = 0;
          name = "";
          description = "";
          isVeg = false;
          isSignature = false;
          order = 0;
        })
        .public_()
        .build(),
      RestaurantLib.allReviews().toEntity<Types.Review>("review", "Review", "id")
        .sample({ id = 0; reviewerName = ""; rating = 0; date = ""; text = "" })
        .public_()
        .build(),
      RestaurantLib.allRatingBreakdown().toEntity<Types.RatingBreakdown>("ratingBreakdown", "RatingBreakdown", "stars")
        .sample({ stars = 0; count = 0 })
        .public_()
        .build(),
      RestaurantLib.allPhotos().toEntity<Types.Photo>("photo", "Photo", "id")
        .sample({ id = 0; title = ""; caption = ""; imageRef = "" })
        .public_()
        .build(),
      reservationState.reservations.toEntity(
        "reservation",
        "Reservation",
        "id",
      )
        .sample({
          id = 0;
          reference = "";
          guestName = "";
          phone = "";
          email = "";
          partySize = 0;
          date = "";
          timeSlot = "";
          specialRequests = null;
          status = #pending;
          createdAt = 0;
        })
        .controllerOnly()
        .build(),
    ];
  });
  include RestaurantApi();
  include ReservationApi(reservationState, accessControlState);
  include ApiDocMixin();
};
