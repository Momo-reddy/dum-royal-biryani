import type { Photo } from "@/backend";
import { SectionHeading } from "@/components/common/SectionHeading";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { usePhotos } from "@/hooks/use-restaurant";
import { cn } from "@/lib/utils";
import { ImageOff } from "lucide-react";
import { useState } from "react";

/**
 * Backend `imageRef` values are stable slugs, not fetchable URLs. Map each slug
 * to the generated asset that ships with the frontend.
 */
const PHOTO_ASSETS: Record<string, string> = {
  "royal-mutton-dum-biryani":
    "/assets/generated/hero-biryani-feast.dim_1600x1000.jpg",
  "hyderabadi-chicken-biryani":
    "/assets/generated/hero-biryani-feast.dim_1600x1000.jpg",
  "murgh-malai-kebab": "/assets/generated/dish-kebab.dim_1000x1000.jpg",
  "tandoor-breads": "/assets/generated/dish-breads.dim_1000x1000.jpg",
  "double-ka-meetha": "/assets/generated/dish-dessert.dim_1000x1000.jpg",
  "dining-room": "/assets/generated/ambience-interior.dim_1200x900.jpg",
};

const FALLBACK_PHOTO = "/assets/generated/dish-beverages.dim_1000x1000.jpg";

function photoSrc(imageRef: string): string {
  return PHOTO_ASSETS[imageRef] ?? FALLBACK_PHOTO;
}

/** Photo gallery grid with a keyboard-accessible lightbox. */
export function PhotosSection() {
  const { data: photos, isLoading } = usePhotos();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const list = photos ?? [];
  const active = activeIndex === null ? null : (list[activeIndex] ?? null);

  return (
    <section
      id="photos"
      data-ocid="photos.section"
      className="scroll-mt-24 border-b border-border bg-gradient-subtle"
    >
      <div className="container py-20">
        <SectionHeading
          eyebrow="The Room"
          title="Photos"
          description="A look at the plates, the charcoal grill, and the warm-lit dining room."
        />

        {isLoading ? (
          <div
            data-ocid="photos.loading_state"
            className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
          >
            {Array.from({ length: 6 }, (_, i) => `photo-skeleton-${i}`).map(
              (id) => (
                <Skeleton
                  key={id}
                  className="aspect-square w-full rounded-lg"
                />
              ),
            )}
          </div>
        ) : list.length > 0 ? (
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {list.map((photo, index) => (
              <button
                key={String(photo.id)}
                type="button"
                data-ocid={`photos.item.${index + 1}`}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "group relative aspect-square overflow-hidden rounded-lg border border-border bg-card focus-ring",
                  index === 0 && "col-span-2 row-span-2",
                )}
              >
                <img
                  src={photoSrc(photo.imageRef)}
                  alt={photo.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-smooth group-hover:scale-105"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-3 text-left">
                  <span className="block truncate font-display text-sm font-semibold text-foreground">
                    {photo.title}
                  </span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div
            data-ocid="photos.empty_state"
            className="mt-10 flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card px-6 py-16 text-center"
          >
            <ImageOff
              className="h-8 w-8 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="font-display text-lg font-semibold text-foreground">
              Photos coming soon
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              We are still plating the gallery — check back shortly.
            </p>
          </div>
        )}
      </div>

      <Dialog
        open={active !== null}
        onOpenChange={(open) => {
          if (!open) setActiveIndex(null);
        }}
      >
        <DialogContent
          data-ocid="photos.lightbox"
          className="max-w-4xl border-border bg-card p-4 sm:max-w-4xl"
        >
          {active ? (
            <figure className="flex flex-col items-center">
              <img
                src={photoSrc(active.imageRef)}
                alt={active.title}
                className="max-h-[70vh] w-auto rounded-lg border border-border object-contain"
              />
              <figcaption className="mt-4 text-center">
                <DialogTitle className="font-display text-lg font-semibold text-foreground">
                  {active.title}
                </DialogTitle>
                {active.caption ? (
                  <DialogDescription className="mt-1 text-sm text-muted-foreground">
                    {active.caption}
                  </DialogDescription>
                ) : null}
              </figcaption>
            </figure>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}
