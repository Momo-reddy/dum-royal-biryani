import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Cell {
    value: Value;
    name: string;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface MenuCategory {
    id: bigint;
    order: bigint;
    name: string;
    description: string;
}
export interface MenuItem {
    id: bigint;
    categoryId: bigint;
    order: bigint;
    name: string;
    description: string;
    isVeg: boolean;
    isSignature: boolean;
}
export interface Photo {
    id: bigint;
    title: string;
    imageRef: string;
    caption: string;
}
export interface RatingBreakdown {
    count: bigint;
    stars: bigint;
}
export interface Reservation {
    id: bigint;
    status: ReservationStatus;
    date: string;
    specialRequests?: string;
    createdAt: bigint;
    reference: string;
    guestName: string;
    email: string;
    partySize: bigint;
    phone: string;
    timeSlot: string;
}
export type ReservationError = {
    __kind__: "closedDay";
    closedDay: null;
} | {
    __kind__: "notAuthorized";
    notAuthorized: null;
} | {
    __kind__: "invalidTimeSlot";
    invalidTimeSlot: null;
} | {
    __kind__: "invalidInput";
    invalidInput: string;
} | {
    __kind__: "alreadyCancelled";
    alreadyCancelled: null;
} | {
    __kind__: "notFound";
    notFound: null;
} | {
    __kind__: "pastDate";
    pastDate: null;
} | {
    __kind__: "slotUnavailable";
    slotUnavailable: null;
};
export interface ReservationInput {
    date: string;
    specialRequests?: string;
    guestName: string;
    email: string;
    partySize: bigint;
    phone: string;
    timeSlot: string;
}
export interface RestaurantProfile {
    tagline: string;
    city: string;
    postalCode: string;
    name: string;
    tags: Array<string>;
    hoursSummary: string;
    state: string;
    priceRangeHigh: bigint;
    priceRangeNote: string;
    addressLine1: string;
    addressLine2: string;
    cuisine: string;
    closingTime: string;
    rating: number;
    phone: string;
    reviewCount: bigint;
    priceRangeLow: bigint;
}
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export interface Review {
    id: bigint;
    date: string;
    text: string;
    reviewerName: string;
    rating: bigint;
}
export interface TimeSlot {
    time: string;
    available: boolean;
}
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export enum ReservationStatus {
    cancelled = "cancelled",
    pending = "pending",
    confirmed = "confirmed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    /**
     * / Staff-only: cancel a reservation and email the guest.
     */
    cancelReservation(id: bigint): Promise<{
        __kind__: "ok";
        ok: Reservation;
    } | {
        __kind__: "err";
        err: ReservationError;
    }>;
    /**
     * / Staff-only: confirm a pending reservation and email the guest.
     */
    confirmReservation(id: bigint): Promise<{
        __kind__: "ok";
        ok: Reservation;
    } | {
        __kind__: "err";
        err: ReservationError;
    }>;
    /**
     * / Public: create a table reservation. No sign-in required.
     */
    createReservation(input: ReservationInput): Promise<{
        __kind__: "ok";
        ok: Reservation;
    } | {
        __kind__: "err";
        err: ReservationError;
    }>;
    execute(qJson: string): Promise<Result>;
    getApiDoc(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    getProfile(): Promise<RestaurantProfile>;
    getRatingBreakdown(): Promise<Array<RatingBreakdown>>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / Public: list bookable time slots for a date (YYYY-MM-DD).
     */
    listAvailableSlots(date: string): Promise<Array<TimeSlot>>;
    listCategories(): Promise<Array<MenuCategory>>;
    listMenuItems(): Promise<Array<MenuItem>>;
    listMenuItemsByCategory(categoryId: bigint): Promise<Array<MenuItem>>;
    listPhotos(): Promise<Array<Photo>>;
    /**
     * / Staff-only: list reservations, optionally filtered by date and status.
     */
    listReservations(date: string | null, status: ReservationStatus | null): Promise<Array<Reservation>>;
    listReviews(): Promise<Array<Review>>;
    schema(): Promise<string>;
}
