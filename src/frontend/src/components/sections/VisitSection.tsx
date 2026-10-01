import type { RestaurantProfile } from "@/backend";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ReservationDialog } from "@/components/reservation/ReservationDialog";
import { Button } from "@/components/ui/button";
import {
  directionsUrl,
  formatAddress,
  getOpenState,
  mapEmbedUrl,
  telHref,
} from "@/lib/restaurant-format";
import { cn } from "@/lib/utils";
import {
  CalendarCheck,
  Check,
  Clock,
  MapPin,
  Navigation,
  Phone,
  Share2,
} from "lucide-react";
import { useState } from "react";

interface VisitSectionProps {
  restaurant: RestaurantProfile;
}

const WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

/** Location, hours, contact actions, and page sharing. */
export function VisitSection({ restaurant }: VisitSectionProps) {
  const fullAddress = formatAddress(restaurant);
  const openState = getOpenState(restaurant.closingTime);
  const [shared, setShared] = useState(false);
  const [reservationOpen, setReservationOpen] = useState(false);

  const todayIndex = (new Date().getDay() + 6) % 7;

  const handleShare = async () => {
    const shareData = {
      title: restaurant.name,
      text: restaurant.tagline,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShared(true);
        window.setTimeout(() => setShared(false), 4000);
      }
    } catch {
      // User dismissed the share sheet — no action needed.
    }
  };

  return (
    <section
      id="visit"
      data-ocid="visit.section"
      className="scroll-mt-24 border-b border-border bg-gradient-subtle"
    >
      <div className="container py-20">
        <SectionHeading
          eyebrow="Find Us"
          title="Visit & Contact"
          description="Tucked into Indiranagar's 80 Feet Road — walk in, or call ahead for a table."
        />

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-6 shadow-subtle">
              <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                <CalendarCheck
                  className="h-5 w-5 text-primary"
                  aria-hidden="true"
                />
                Reserve a Table
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Planning a dinner or a celebration? Book ahead and we will keep
                a table ready — no sign-in required.
              </p>
              <Button
                type="button"
                data-ocid="visit.reserve_button"
                onClick={() => setReservationOpen(true)}
                className="mt-5 rounded-full bg-gradient-primary font-semibold text-primary-foreground shadow-subtle transition-smooth hover:shadow-elevated"
              >
                <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                Reserve a Table
              </Button>
            </div>

            <div className="rounded-lg border border-border bg-card p-6 shadow-subtle">
              <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
                Address
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {fullAddress}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button
                  asChild
                  className="rounded-full bg-gradient-primary font-semibold text-primary-foreground shadow-subtle transition-smooth hover:shadow-elevated"
                >
                  <a
                    href={directionsUrl(fullAddress)}
                    target="_blank"
                    rel="noreferrer"
                    data-ocid="visit.directions_button"
                  >
                    <Navigation className="h-4 w-4" aria-hidden="true" />
                    Get Directions
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full border-border transition-smooth"
                >
                  <a
                    href={telHref(restaurant.phone)}
                    data-ocid="visit.call_button"
                  >
                    <Phone className="h-4 w-4" aria-hidden="true" />
                    {restaurant.phone}
                  </a>
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6 shadow-subtle">
              <div className="flex items-center justify-between gap-4">
                <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                  <Clock className="h-5 w-5 text-primary" aria-hidden="true" />
                  Opening Hours
                </h3>
                <span
                  data-ocid="visit.open_status"
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
                  {openState.isOpen ? "Open now" : "Closed"}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {restaurant.hoursSummary} · Closes {restaurant.closingTime}
              </p>
              <ul className="mt-4 flex flex-col divide-y divide-border">
                {WEEK.map((day, index) => (
                  <li
                    key={day}
                    className={cn(
                      "flex items-center justify-between py-2 text-sm",
                      index === todayIndex
                        ? "font-medium text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    <span>{day}</span>
                    <span className="font-mono text-xs">
                      11:00 am – {restaurant.closingTime}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              type="button"
              variant="outline"
              data-ocid="visit.share_button"
              onClick={handleShare}
              className="w-fit rounded-full border-border transition-smooth"
            >
              {shared ? (
                <Check className="h-4 w-4 text-success" aria-hidden="true" />
              ) : (
                <Share2 className="h-4 w-4" aria-hidden="true" />
              )}
              {shared ? "Link copied" : "Share this page"}
            </Button>
          </div>

          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-subtle">
            <iframe
              title={`Map showing ${restaurant.name}`}
              src={mapEmbedUrl(fullAddress)}
              data-ocid="visit.map"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full min-h-[420px] w-full border-0"
            />
          </div>
        </div>
      </div>

      <ReservationDialog
        open={reservationOpen}
        onOpenChange={setReservationOpen}
      />
    </section>
  );
}
