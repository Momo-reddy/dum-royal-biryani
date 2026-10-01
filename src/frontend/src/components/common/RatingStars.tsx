import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface RatingStarsProps {
  /** Rating out of 5, may be fractional. */
  rating: number;
  /** Pixel size of each star. */
  size?: number;
  className?: string;
}

/** Five-star display with fractional fill via a clipped overlay. */
export function RatingStars({
  rating,
  size = 16,
  className,
}: RatingStarsProps) {
  const clamped = Math.max(0, Math.min(5, rating));
  const percent = (clamped / 5) * 100;

  return (
    <span
      className={cn("relative inline-flex", className)}
      role="img"
      aria-label={`${clamped.toFixed(1)} out of 5 stars`}
    >
      <span className="flex gap-0.5 text-muted-foreground/40">
        {[0, 1, 2, 3, 4].map((index) => (
          <Star key={index} size={size} strokeWidth={1.5} aria-hidden="true" />
        ))}
      </span>
      <span
        className="absolute inset-0 flex gap-0.5 overflow-hidden text-primary"
        style={{ width: `${percent}%` }}
        aria-hidden="true"
      >
        {[0, 1, 2, 3, 4].map((index) => (
          <Star
            key={index}
            size={size}
            strokeWidth={1.5}
            className="shrink-0 fill-current"
          />
        ))}
      </span>
    </span>
  );
}
