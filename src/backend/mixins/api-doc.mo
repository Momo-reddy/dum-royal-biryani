mixin () {
  public query func getApiDoc() : async Text {
    "# DUM | The Royal Biryani Kitchen — Backend API\n\n" #
    "Backend for the DUM | The Royal Biryani Kitchen marketing site. It serves the\n" #
    "restaurant profile, menu, reviews, rating breakdown, and photo gallery, and\n" #
    "exposes the same content to the Caffeine Data Intelligence agent through the\n" #
    "Object Query Layer (OQL). It also provides a table reservation system: guests\n" #
    "create reservations without signing in, and signed-in staff list, confirm, and\n" #
    "cancel them.\n\n" #
    "## Authentication and authorization\n\n" #
    "- The restaurant content methods (`getProfile`, `listCategories`,\n" #
    "  `listMenuItems`, `listMenuItemsByCategory`, `listReviews`,\n" #
    "  `getRatingBreakdown`, `listPhotos`) are `query` (read-only) calls and require\n" #
    "  no sign-in.\n" #
    "- `createReservation` and `listAvailableSlots` are public: any caller,\n" #
    "  including anonymous, may book a table and read slot availability.\n" #
    "- `listReservations`, `confirmReservation`, and `cancelReservation` are\n" #
    "  staff-only. They require a signed-in caller holding a staff or admin role.\n" #
    "  An unregistered or anonymous caller receives `#err(#notAuthorized)`.\n" #
    "- All restaurant content is public marketing data. The OQL entities\n" #
    "  `category`, `menuItem`, `review`, `ratingBreakdown`, and `photo` are\n" #
    "  registered with `.public_()`, so `schema()` and `execute()` may be called by\n" #
    "  anyone, including anonymous callers, and return all rows.\n" #
    "- The OQL entity `reservation` is registered with `.controllerOnly()`: only\n" #
    "  the platform controller (and the Data Intelligence agent acting as it) may\n" #
    "  read reservation rows through OQL. Staff read reservations through the\n" #
    "  role-guarded `listReservations` endpoint, not through OQL. A non-controller\n" #
    "  caller receives a denied access result from `execute()` for that entity.\n" #
    "- The actor also includes the platform authorization mixin\n" #
    "  (`MixinAuthorization`). It provides role management endpoints\n" #
    "  (`_initialize_access_control`, role assignment, and role queries). The first\n" #
    "  signed-in caller to invoke `_initialize_access_control` becomes the owner;\n" #
    "  subsequent callers receive the default role. A direct API caller must\n" #
    "  register by calling `_initialize_access_control` once as a signed-in caller\n" #
    "  before any role-guarded call. Registration happens only when a caller signs\n" #
    "  in through the app's own frontend, so a principal that never did so is\n" #
    "  unregistered even when it belongs to the app's owner.\n" #
    "- The frontend pins an Internet Identity derivation origin, published at\n" #
    "  `/.well-known/ii-derivation-origin` when available. An agent already holding\n" #
    "  the user's Internet Identity authorization derives the correct per-app\n" #
    "  principal against that origin (for example\n" #
    "  `icp identity link web <name> --app <host>`). Such a delegation acts with the\n" #
    "  user's full authority in this app until it expires.\n\n" #
    "## Methods\n\n" #
    "### getProfile() : RestaurantProfile\n" #
    "Returns the restaurant's identity and contact block: name, tagline, cuisine,\n" #
    "rating, review count, price range, tags, address, phone, and hours summary.\n\n" #
    "### listCategories() : [MenuCategory]\n" #
    "Returns all menu categories in display order. Each category has `id`, `name`,\n" #
    "`description`, and `order`.\n\n" #
    "### listMenuItems() : [MenuItem]\n" #
    "Returns every menu item. Each item has `id`, `categoryId`, `name`,\n" #
    "`description`, `isVeg`, `isSignature`, and `order`. Menu items carry no\n" #
    "per-dish price; the only price information is the profile-level\n" #
    "`priceRangeLow` / `priceRangeHigh` / `priceRangeNote`.\n\n" #
    "### listMenuItemsByCategory(categoryId : Nat) : [MenuItem]\n" #
    "Returns the menu items whose `categoryId` equals the argument. An unknown\n" #
    "`categoryId` returns an empty array, not an error.\n\n" #
    "### listReviews() : [Review]\n" #
    "Returns the featured customer reviews. Each review has `id`, `reviewerName`,\n" #
    "`rating`, `date`, and `text`.\n\n" #
    "### getRatingBreakdown() : [RatingBreakdown]\n" #
    "Returns the star distribution as `{ stars, count }` entries, one per star\n" #
    "rating from 5 down to 1.\n\n" #
    "### listPhotos() : [Photo]\n" #
    "Returns the gallery entries. Each photo has `id`, `title`, `caption`, and\n" #
    "`imageRef`. `imageRef` is a stable slug identifying the image asset; it is not\n" #
    "a URL.\n\n" #
    "### createReservation(input : ReservationInput) : Result<Reservation, ReservationError>\n" #
    "Public. Creates a table reservation. `input` carries `guestName`, `phone`,\n" #
    "`email`, `partySize`, `date` (YYYY-MM-DD), `timeSlot` (HH:MM), and optional\n" #
    "`specialRequests`. On success returns the stored `Reservation` with its\n" #
    "assigned `id`, `reference`, `status` (`#pending`), and `createdAt`. Fails with\n" #
    "`#invalidInput`, `#pastDate`, `#closedDay`, `#invalidTimeSlot`, or\n" #
    "`#slotUnavailable`.\n\n" #
    "### listAvailableSlots(date : Text) : [TimeSlot]\n" #
    "Public. Returns the bookable slots for a calendar date (YYYY-MM-DD) as\n" #
    "`{ time, available }` entries. A closed day returns an empty array.\n\n" #
    "### listReservations(date : ?Text, status : ?ReservationStatus) : [Reservation]\n" #
    "Staff-only. Returns reservations sorted by date then time slot. Pass `null`\n" #
    "for either filter to skip it. A caller without a staff or admin role receives\n" #
    "an empty array; the method does not trap and does not reveal whether any\n" #
    "reservations exist.\n\n" #
    "### confirmReservation(id : Nat) : Result<Reservation, ReservationError>\n" #
    "Staff-only. Moves a pending reservation to `#confirmed` and emails the guest.\n" #
    "Fails with `#notFound`, `#alreadyCancelled`, or `#notAuthorized`.\n\n" #
    "### cancelReservation(id : Nat) : Result<Reservation, ReservationError>\n" #
    "Staff-only. Moves a pending or confirmed reservation to `#cancelled` and\n" #
    "emails the guest. Fails with `#notFound`, `#alreadyCancelled`, or\n" #
    "`#notAuthorized`.\n\n" #
    "### schema() : Text\n" #
    "OQL schema discovery. Returns a JSON description of the queryable entities:\n" #
    "`category`, `menuItem`, `review`, `ratingBreakdown`, `photo`, and\n" #
    "`reservation`. The `reservation` entity is controller-only, so its fields are\n" #
    "reported only to a controller caller.\n\n" #
    "### execute(queryJson : Text) : Text\n" #
    "OQL query execution. Accepts a JSON query document and returns matching rows as\n" #
    "JSON. See the OQL extension documentation for the query grammar (filter,\n" #
    "order, paginate, aggregate, and dotted-path edges). The `reservation` entity\n" #
    "is readable only by the controller; other callers receive a denied result for\n" #
    "it. Reservation rows expose `id`, `reference`, `guestName`, `phone`, `email`,\n" #
    "`partySize`, `date`, `timeSlot`, `specialRequests` (empty string when absent),\n" #
    "`status` (the tag text `pending` | `confirmed` | `cancelled`), and `createdAt`.\n\n" #
    "## Units and encodings\n\n" #
    "- `rating` is a `Float` (for example `4.6`).\n" #
    "- `priceRangeLow`, `priceRangeHigh`, `reviewCount`, `count`, `stars`,\n" #
    "  `rating` (on a review), `partySize`, and all `id`/`order` fields are `Nat`\n" #
    "  (unsigned integers). The profile price range is in Indian Rupees (INR),\n" #
    "  whole rupees.\n" #
    "- `date` on a review and on a reservation is an ISO-8601 calendar date string\n" #
    "  (`YYYY-MM-DD`).\n" #
    "- `timeSlot` is a 24-hour `HH:MM` wall-clock string within opening hours.\n" #
    "- `createdAt` is a nanosecond timestamp (`Time.now()`).\n" #
    "- `specialRequests` is an optional `Text` (`null` when omitted).\n" #
    "- `status` is the variant `#pending` | `#confirmed` | `#cancelled`.\n" #
    "- `tags` is an array of `Text`.\n" #
    "- `isVeg` and `isSignature` are `Bool`.\n\n" #
    "## Lifecycle and polling\n\n" #
    "- Restaurant content is static seed data compiled into the canister. It does\n" #
    "  not change at runtime, so there is nothing to poll and no completion\n" #
    "  condition to wait for. A single call always returns the current, complete\n" #
    "  dataset.\n" #
    "- A reservation starts `#pending`, becomes `#confirmed` when staff confirm it,\n" #
    "  and `#cancelled` when staff cancel it. `#cancelled` is terminal. Staff can\n" #
    "  poll `listReservations` to observe status changes.\n" #
    "- `schema()` and `execute()` are also `query` calls and are safe to call\n" #
    "  repeatedly.\n\n" #
    "## Mutation retry safety\n\n" #
    "- `createReservation` is not idempotent: each successful call creates a new\n" #
    "  reservation with a fresh `id` and `reference`. Retrying after a timeout may\n" #
    "  create a duplicate booking; check `listAvailableSlots` and the guest's\n" #
    "  reference before retrying.\n" #
    "- `confirmReservation` is idempotent: confirming an already-confirmed\n" #
    "  reservation returns `#ok` with the unchanged reservation. Confirming a\n" #
    "  cancelled reservation returns `#err(#alreadyCancelled)`.\n" #
    "- `cancelReservation` is idempotent in effect: cancelling an already-cancelled\n" #
    "  reservation returns `#err(#alreadyCancelled)` and leaves state unchanged.\n" #
    "  Cancelling is terminal.\n" #
    "- The authorization mixin's role management calls are state-changing and\n" #
    "  outside the restaurant content surface.\n\n" #
    "## Errors, traps, and gotchas\n\n" #
    "- Reservation operations return `Result<Reservation, ReservationError>` rather\n" #
    "  than trapping, so callers can branch on the error variant.\n" #
    "- `listMenuItemsByCategory` never traps; an unmatched `categoryId` yields `[]`.\n" #
    "- `execute` returns a JSON error document for a malformed query rather than\n" #
    "  trapping.\n" #
    "- OQL schema fields are reported in lexicographic order, not the display order\n" #
    "  used by `listCategories` / `listMenuItems`. Use the `order` field to sort for\n" #
    "  display.\n" #
    "- `imageRef` is an asset slug, not a fetchable URL.\n" #
    "- The restaurant content endpoints and `createReservation` require no\n" #
    "  authentication; do not assume a signed-in caller. Only the staff reservation\n" #
    "  management endpoints require a role.\n"
  };
};
