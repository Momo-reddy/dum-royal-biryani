import { ReservationDialog } from "@/components/reservation/ReservationDialog";
import { Button } from "@/components/ui/button";
import { telHref } from "@/lib/restaurant-format";
import { cn } from "@/lib/utils";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { CalendarCheck, LayoutDashboard, Menu, Phone, X } from "lucide-react";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { id: "overview", label: "Overview" },
  { id: "menu", label: "Menu" },
  { id: "reviews", label: "Reviews" },
  { id: "photos", label: "Photos" },
  { id: "visit", label: "Visit" },
] as const;

interface SiteHeaderProps {
  restaurantName: string;
  phone: string;
}

/** Sticky top navigation with wordmark, section links, and order CTA. */
export function SiteHeader({ restaurantName, phone }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [reservationOpen, setReservationOpen] = useState(false);
  const { isAuthenticated } = useInternetIdentity();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setOpen(false);
    if (window.location.pathname.replace(/\/+$/, "") === "/staff") {
      window.history.pushState({}, "", "/");
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const goToStaff = () => {
    setOpen(false);
    if (window.location.pathname.replace(/\/+$/, "") !== "/staff") {
      window.history.pushState({}, "", "/staff");
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header
      data-ocid="site.header"
      className={cn(
        "sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur transition-smooth",
        scrolled ? "shadow-subtle" : "shadow-none",
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-4 md:h-20">
        <button
          type="button"
          data-ocid="site.logo_link"
          onClick={() => scrollTo("overview")}
          className="flex min-w-0 items-center gap-3 text-left focus-ring rounded-md"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-primary font-display text-lg font-bold text-primary-foreground shadow-subtle">
            D
          </span>
          <span className="flex min-w-0 flex-col leading-none">
            <span className="truncate font-display text-lg font-semibold tracking-tight text-foreground">
              {restaurantName}
            </span>
            <span className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              Royal Biryani Kitchen
            </span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              type="button"
              data-ocid={`site.nav.${link.id}`}
              onClick={() => scrollTo(link.id)}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-smooth hover:bg-secondary hover:text-foreground focus-ring"
            >
              {link.label}
            </button>
          ))}
          {isAuthenticated ? (
            <button
              type="button"
              data-ocid="site.nav.staff"
              onClick={goToStaff}
              className="rounded-md px-3 py-2 text-sm font-medium text-primary transition-smooth hover:bg-secondary focus-ring"
            >
              Reservations
            </button>
          ) : null}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="hidden rounded-full sm:inline-flex"
          >
            <a href={telHref(phone)} data-ocid="site.call_button">
              <Phone className="h-4 w-4" aria-hidden="true" />
              Call
            </a>
          </Button>
          <Button
            type="button"
            data-ocid="site.reserve_button"
            onClick={() => {
              setOpen(false);
              setReservationOpen(true);
            }}
            className="rounded-full bg-gradient-primary font-semibold text-primary-foreground shadow-subtle transition-smooth hover:shadow-elevated"
          >
            <CalendarCheck className="h-4 w-4" aria-hidden="true" />
            Reserve a Table
          </Button>
          <Button
            type="button"
            variant="outline"
            data-ocid="site.order_button"
            onClick={() => scrollTo("menu")}
            className="hidden rounded-full border-border transition-smooth md:inline-flex"
          >
            Order Online
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            data-ocid="site.menu_toggle"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open ? (
        <nav
          data-ocid="site.mobile_menu"
          aria-label="Mobile"
          className="border-t border-border bg-card lg:hidden"
        >
          <div className="container flex flex-col py-2">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                type="button"
                data-ocid={`site.mobile_nav.${link.id}`}
                onClick={() => scrollTo(link.id)}
                className="rounded-md px-3 py-3 text-left text-base font-medium text-foreground transition-smooth hover:bg-secondary focus-ring"
              >
                {link.label}
              </button>
            ))}
            <button
              type="button"
              data-ocid="site.mobile_reserve_button"
              onClick={() => {
                setOpen(false);
                setReservationOpen(true);
              }}
              className="rounded-md px-3 py-3 text-left text-base font-semibold text-primary transition-smooth hover:bg-secondary focus-ring"
            >
              Reserve a Table
            </button>
            {isAuthenticated ? (
              <button
                type="button"
                data-ocid="site.mobile_nav.staff"
                onClick={goToStaff}
                className="flex items-center gap-2 rounded-md px-3 py-3 text-left text-base font-medium text-primary transition-smooth hover:bg-secondary focus-ring"
              >
                <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                Reservations
              </button>
            ) : null}
            <a
              href={telHref(phone)}
              data-ocid="site.mobile_call_link"
              className="rounded-md px-3 py-3 text-base font-medium text-primary transition-smooth hover:bg-secondary focus-ring"
            >
              Call {phone}
            </a>
          </div>
        </nav>
      ) : null}

      <ReservationDialog
        open={reservationOpen}
        onOpenChange={setReservationOpen}
      />
    </header>
  );
}
