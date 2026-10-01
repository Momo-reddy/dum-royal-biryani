import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { HeroSection } from "@/components/sections/HeroSection";
import { MenuSection } from "@/components/sections/MenuSection";
import { PhotosSection } from "@/components/sections/PhotosSection";
import { ReviewsSection } from "@/components/sections/ReviewsSection";
import { VisitSection } from "@/components/sections/VisitSection";
import { useProfile } from "@/hooks/use-restaurant";
import StaffReservationsPage from "@/pages/StaffReservationsPage";
import { useEffect, useState } from "react";

const FALLBACK_PROFILE = {
  name: "DUM | The Royal Biryani Kitchen",
  tagline:
    "Slow-cooked Awadhi biryani, dum-sealed and served with royal intent.",
  cuisine: "Biryani · Indian",
  rating: 4.6,
  reviewCount: 1024n,
  priceRangeLow: 400n,
  priceRangeHigh: 1600n,
  priceRangeNote: "per person",
  tags: ["Happy-hour food", "Vegetarian options", "Kids' menu"],
  addressLine1: "35, 80 Feet Rd, HAL 3rd Stage",
  addressLine2: "Indiranagar",
  city: "Bengaluru",
  state: "Karnataka",
  postalCode: "560075",
  phone: "099000 06552",
  hoursSummary: "Open daily · 11 am – 2 am",
  closingTime: "2 am",
};

/** Normalize the current pathname to a known route. */
function currentRoute(): "home" | "staff" {
  return window.location.pathname.replace(/\/+$/, "") === "/staff"
    ? "staff"
    : "home";
}

export default function App() {
  const { data: profile } = useProfile();
  const restaurant = profile ?? FALLBACK_PROFILE;
  const [route, setRoute] = useState<"home" | "staff">(currentRoute);

  useEffect(() => {
    const onPopState = () => setRoute(currentRoute());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader restaurantName={restaurant.name} phone={restaurant.phone} />

      <main className="flex-1">
        {route === "staff" ? (
          <StaffReservationsPage />
        ) : (
          <>
            <HeroSection restaurant={restaurant} />
            <MenuSection />
            <PhotosSection />
            <ReviewsSection
              rating={restaurant.rating}
              reviewCount={restaurant.reviewCount}
            />
            <VisitSection restaurant={restaurant} />
          </>
        )}
      </main>

      <SiteFooter
        restaurantName={restaurant.name}
        tagline={restaurant.tagline}
        address={{
          addressLine1: restaurant.addressLine1,
          addressLine2: restaurant.addressLine2,
          city: restaurant.city,
          state: restaurant.state,
          postalCode: restaurant.postalCode,
        }}
        phone={restaurant.phone}
        hoursSummary={restaurant.hoursSummary}
        closingTime={restaurant.closingTime}
      />
    </div>
  );
}
