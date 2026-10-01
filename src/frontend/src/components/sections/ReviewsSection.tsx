import type { RatingBreakdown, Review } from "@/backend";
import { RatingStars } from "@/components/common/RatingStars";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Skeleton } from "@/components/ui/skeleton";
import { useRatingBreakdown, useReviews } from "@/hooks/use-restaurant";
import { formatCount, formatRating } from "@/lib/restaurant-format";
import { cn } from "@/lib/utils";
import { MessageSquareQuote } from "lucide-react";
import { useMemo } from "react";

interface ReviewsSectionProps {
  rating: number;
  reviewCount: bigint;
}

/** Overall rating summary, star breakdown, and written customer reviews. */
export function ReviewsSection({ rating, reviewCount }: ReviewsSectionProps) {
  const { data: reviews, isLoading: reviewsLoading } = useReviews();
  const { data: breakdown, isLoading: breakdownLoading } = useRatingBreakdown();

  const list = reviews ?? [];

  const rows = useMemo(() => {
    const byStars = new Map<number, bigint>();
    for (const entry of breakdown ?? []) {
      byStars.set(Number(entry.stars), entry.count);
    }
    const total = Number(reviewCount) || 1;
    return [5, 4, 3, 2, 1].map((stars) => {
      const count = byStars.get(stars) ?? 0n;
      return {
        stars,
        count,
        percent: Math.round((Number(count) / total) * 100),
      };
    });
  }, [breakdown, reviewCount]);

  const isLoading = reviewsLoading || breakdownLoading;

  return (
    <section
      id="reviews"
      data-ocid="reviews.section"
      className="scroll-mt-24 border-b border-border bg-background"
    >
      <div className="container py-20">
        <SectionHeading
          eyebrow="Guest Book"
          title="Reviews"
          description="What diners say after the last spoon of biryani."
        />

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,320px)_1fr]">
          <div className="rounded-lg border border-border bg-card p-6 shadow-subtle">
            <div className="flex items-end gap-3">
              <span className="font-display text-5xl font-semibold leading-none text-foreground">
                {formatRating(rating)}
              </span>
              <div className="pb-1">
                <RatingStars rating={rating} size={18} />
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatCount(reviewCount)} reviews
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2.5">
              {isLoading
                ? Array.from(
                    { length: 5 },
                    (_, i) => `rating-skeleton-${i}`,
                  ).map((id) => <Skeleton key={id} className="h-4 w-full" />)
                : rows.map((row) => (
                    <div
                      key={row.stars}
                      data-ocid={`reviews.breakdown.${row.stars}`}
                      className="flex items-center gap-3"
                    >
                      <span className="w-8 shrink-0 font-mono text-xs text-muted-foreground">
                        {row.stars}★
                      </span>
                      <span className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                        <span
                          className="block h-full rounded-full bg-primary"
                          style={{ width: `${row.percent}%` }}
                        />
                      </span>
                      <span className="w-10 shrink-0 text-right font-mono text-xs text-muted-foreground">
                        {formatCount(row.count)}
                      </span>
                    </div>
                  ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {isLoading ? (
              <div
                data-ocid="reviews.loading_state"
                className="flex flex-col gap-4"
              >
                {Array.from(
                  { length: 3 },
                  (_, i) => `review-skeleton-${i}`,
                ).map((id) => (
                  <Skeleton key={id} className="h-32 w-full rounded-lg" />
                ))}
              </div>
            ) : list.length > 0 ? (
              list.map((review: Review, index) => (
                <article
                  key={String(review.id)}
                  data-ocid={`reviews.item.${index + 1}`}
                  className="rounded-lg border border-border bg-card p-5 shadow-subtle"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary font-display text-base font-semibold text-secondary-foreground",
                        )}
                        aria-hidden="true"
                      >
                        {review.reviewerName.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <p className="font-display text-base font-semibold text-foreground">
                          {review.reviewerName}
                        </p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {review.date}
                        </p>
                      </div>
                    </div>
                    <RatingStars rating={Number(review.rating)} size={14} />
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {review.text}
                  </p>
                </article>
              ))
            ) : (
              <div
                data-ocid="reviews.empty_state"
                className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card px-6 py-16 text-center"
              >
                <MessageSquareQuote
                  className="h-8 w-8 text-muted-foreground"
                  aria-hidden="true"
                />
                <p className="font-display text-lg font-semibold text-foreground">
                  No written reviews yet
                </p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Be the first to share your experience at DUM.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
