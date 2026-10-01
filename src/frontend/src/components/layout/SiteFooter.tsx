import { formatAddress, telHref } from "@/lib/restaurant-format";
import { Clock, MapPin, Phone } from "lucide-react";

interface SiteFooterProps {
  restaurantName: string;
  tagline: string;
  address: {
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
  };
  phone: string;
  hoursSummary: string;
  closingTime: string;
}

/** Site footer with contact details, hours, and attribution. */
export function SiteFooter({
  restaurantName,
  tagline,
  address,
  phone,
  hoursSummary,
  closingTime,
}: SiteFooterProps) {
  const fullAddress = formatAddress(address);
  const year = new Date().getFullYear();

  return (
    <footer
      data-ocid="site.footer"
      className="border-t border-border bg-gradient-royal text-foreground"
    >
      <div className="container grid gap-10 py-14 md:grid-cols-3">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary font-display text-lg font-bold text-primary-foreground">
              D
            </span>
            <span className="font-display text-xl font-semibold tracking-tight">
              {restaurantName}
            </span>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            {tagline}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-mono text-xs uppercase tracking-[0.28em] text-primary">
            Visit Us
          </h3>
          <p className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
            <MapPin
              className="mt-0.5 h-4 w-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            <span>{fullAddress}</span>
          </p>
          <a
            href={telHref(phone)}
            data-ocid="footer.call_link"
            className="flex items-center gap-3 text-sm font-medium text-foreground transition-smooth hover:text-primary focus-ring rounded-md"
          >
            <Phone
              className="h-4 w-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            {phone}
          </a>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-mono text-xs uppercase tracking-[0.28em] text-primary">
            Hours
          </h3>
          <p className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
            <Clock
              className="mt-0.5 h-4 w-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            <span>
              {hoursSummary}
              <br />
              Closes {closingTime}
            </span>
          </p>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="container flex flex-col items-center justify-between gap-3 py-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {year} {restaurantName}. All rights reserved.
          </p>
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noreferrer"
            className="transition-smooth hover:text-primary focus-ring rounded-md"
          >
            © {year}. Built with love using caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}
