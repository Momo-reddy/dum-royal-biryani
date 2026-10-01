import type { RestaurantProfile } from "@/backend";
import { Chip } from "@/components/common/Chip";
import { RatingStars } from "@/components/common/RatingStars";
import { Button } from "@/components/ui/button";
import {
  directionsUrl,
  formatAddress,
  formatCount,
  formatRating,
  formatRupees,
  getOpenState,
  telHref,
} from "@/lib/restaurant-format";
import { cn } from "@/lib/utils";
import { Clock, MapPin, Navigation, Phone, Star } from "lucide-react";

interface HeroSectionProps {
  restaurant: RestaurantProfile;
}

/** Full-width hero with the restaurant identity, live status, and primary actions. */
export function HeroSection({ restaurant }: HeroSectionProps) {
  const fullAddress = formatAddress(restaurant);
  const openState = getOpenState(restaurant.closingTime);
  const priceRange = `${formatRupees(restaurant.priceRangeLow)}–${formatRupees(
    restaurant.priceRangeHigh,
  )}`;

  const scrollToMenu = () => {
    document
      .getElementById("menu")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      id="overview"
      data-ocid="overview.section"
      className="relative scroll-mt-24 overflow-hidden border-b border-border bg-gradient-royal"
    >
      <div className="absolute inset-0">
        <img
          src="/assets/generated/hero-biryani-feast.dim_1600x1000.jpg"
          alt="A royal biryani feast laid out on a dark table with saffron rice, kebabs, and breads"
          className="h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="container relative py-20 sm:py-28">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-[0.28em] text-primary">
              {restaurant.cuisine}
            </span>
            <span
              data-ocid="overview.open_status"
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                openState.isOpen
                  ? "bg-success/15 text-success"
                  : "bg-destructive/15 text-destructive",
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  openState.isOpen ? "bg-success" : "bg-destructive",
                )}
                aria-hidden="true"
              />
              {openState.label}
            </span>
          </div>

          <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
            {restaurant.name}
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {restaurant.tagline}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <span className="inline-flex items-center gap-2">
              <RatingStars rating={restaurant.rating} size={18} />
              <span className="font-display text-lg font-semibold text-foreground">
                {formatRating(restaurant.rating)}
              </span>
              <span className="text-sm text-muted-foreground">
                ({formatCount(restaurant.reviewCount)} reviews)
              </span>
            </span>
            <span
              className="hidden h-5 w-px bg-border sm:block"
              aria-hidden="true"
            />
            <span className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{priceRange}</span>{" "}
              {restaurant.priceRangeNote}
            </span>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {restaurant.tags.map((tag) => (
              <Chip key={tag} variant="accent">
                {tag}
              </Chip>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              data-ocid="overview.order_button"
              onClick={scrollToMenu}
              className="rounded-full bg-gradient-primary font-semibold text-primary-foreground shadow-subtle transition-smooth hover:shadow-elevated"
            >
              Order Online
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-full border-border bg-card/60 backdrop-blur transition-smooth hover:bg-card"
            >
              <a
                href={directionsUrl(fullAddress)}
                target="_blank"
                rel="noreferrer"
                data-ocid="overview.directions_button"
              >
                <Navigation className="h-4 w-4" aria-hidden="true" />
                Directions
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-full border-border bg-card/60 backdrop-blur transition-smooth hover:bg-card"
            >
              <a
                href={telHref(restaurant.phone)}
                data-ocid="overview.call_button"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                Call
              </a>
            </Button>
          </div>

          <div className="mt-10 flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-6">
            <span className="inline-flex items-start gap-2">
              <MapPin
                className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              {fullAddress}
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock
                className="h-4 w-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              {restaurant.hoursSummary}
            </span>
          </div>
        </div>
      </div>

      <span className="sr-only">
        <Star aria-hidden="true" /> Rated {formatRating(restaurant.rating)} out
        of 5
      </span>
    </section>
  );
}
