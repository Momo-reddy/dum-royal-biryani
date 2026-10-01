import type { MenuCategory, MenuItem } from "@/backend";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories, useMenuItems } from "@/hooks/use-restaurant";
import { cn } from "@/lib/utils";
import { Search, Sparkles, UtensilsCrossed } from "lucide-react";
import { useMemo, useState } from "react";

/** Small veg / non-veg square marker used beside every dish name. */
function DietMark({ isVeg }: { isVeg: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border",
        isVeg ? "border-success" : "border-destructive",
      )}
      title={isVeg ? "Vegetarian" : "Non-vegetarian"}
      aria-label={isVeg ? "Vegetarian" : "Non-vegetarian"}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          isVeg ? "bg-success" : "bg-destructive",
        )}
        aria-hidden="true"
      />
    </span>
  );
}

function MenuItemRow({ item }: { item: MenuItem }) {
  return (
    <li
      data-ocid={`menu.item.${Number(item.id)}`}
      className={cn(
        "flex flex-col gap-2 rounded-lg border p-4 transition-smooth",
        item.isSignature
          ? "border-primary/40 bg-primary/5"
          : "border-border bg-card hover:border-primary/30",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <DietMark isVeg={item.isVeg} />
        <h4 className="font-display text-base font-semibold text-foreground">
          {item.name}
        </h4>
        {item.isSignature ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            Chef&apos;s pick
          </span>
        ) : null}
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {item.description}
      </p>
    </li>
  );
}

/** Menu with category tabs, in-menu search, and signature dish highlights. */
export function MenuSection() {
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: items, isLoading: itemsLoading } = useMenuItems();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [query, setQuery] = useState("");

  const sortedCategories = useMemo(
    () => [...(categories ?? [])].sort((a, b) => Number(a.order - b.order)),
    [categories],
  );

  const sortedItems = useMemo(
    () => [...(items ?? [])].sort((a, b) => Number(a.order - b.order)),
    [items],
  );

  const normalizedQuery = query.trim().toLowerCase();

  const visibleCategories = useMemo(() => {
    const scoped =
      activeCategory === "all"
        ? sortedCategories
        : sortedCategories.filter((c) => String(c.id) === activeCategory);

    return scoped
      .map((category) => ({
        category,
        items: sortedItems.filter((item) => {
          if (String(item.categoryId) !== String(category.id)) return false;
          if (!normalizedQuery) return true;
          return (
            item.name.toLowerCase().includes(normalizedQuery) ||
            item.description.toLowerCase().includes(normalizedQuery)
          );
        }),
      }))
      .filter((group) => group.items.length > 0);
  }, [activeCategory, normalizedQuery, sortedCategories, sortedItems]);

  const isLoading = categoriesLoading || itemsLoading;
  const hasResults = visibleCategories.length > 0;

  return (
    <section
      id="menu"
      data-ocid="menu.section"
      className="scroll-mt-24 border-b border-border bg-background"
    >
      <div className="container py-20">
        <SectionHeading
          eyebrow="The Kitchen"
          title="Our Menu"
          description="Dum-sealed biryanis, charcoal kebabs, and slow-baked breads — cooked to order in the Awadhi tradition."
        />

        <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div
            className="flex flex-wrap gap-2"
            role="tablist"
            aria-label="Menu categories"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === "all"}
              data-ocid="menu.category.tab.all"
              onClick={() => setActiveCategory("all")}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-smooth focus-ring",
                activeCategory === "all"
                  ? "bg-primary text-primary-foreground shadow-subtle"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/70",
              )}
            >
              All
            </button>
            {sortedCategories.map((category) => (
              <button
                key={String(category.id)}
                type="button"
                role="tab"
                aria-selected={activeCategory === String(category.id)}
                data-ocid={`menu.category.tab.${Number(category.id)}`}
                onClick={() => setActiveCategory(String(category.id))}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-smooth focus-ring",
                  activeCategory === String(category.id)
                    ? "bg-primary text-primary-foreground shadow-subtle"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/70",
                )}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:max-w-xs">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search dishes…"
              aria-label="Search the menu"
              data-ocid="menu.search_input"
              className="rounded-full pl-9"
            />
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-12">
          {isLoading ? (
            <div
              data-ocid="menu.loading_state"
              className="grid gap-4 sm:grid-cols-2"
            >
              {Array.from({ length: 6 }, (_, i) => `menu-skeleton-${i}`).map(
                (id) => (
                  <Skeleton key={id} className="h-24 w-full rounded-lg" />
                ),
              )}
            </div>
          ) : hasResults ? (
            visibleCategories.map(({ category, items: categoryItems }) => (
              <div
                key={String(category.id)}
                data-ocid={`menu.category.${Number(category.id)}`}
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-2xl font-semibold text-foreground">
                    {category.name}
                  </h3>
                  <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    {categoryItems.length} dishes
                  </span>
                </div>
                {category.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {category.description}
                  </p>
                ) : null}
                <span className="rule-dum mt-4 block" aria-hidden="true" />
                <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                  {categoryItems.map((item) => (
                    <MenuItemRow key={String(item.id)} item={item} />
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <div
              data-ocid="menu.empty_state"
              className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card px-6 py-16 text-center"
            >
              <UtensilsCrossed
                className="h-8 w-8 text-muted-foreground"
                aria-hidden="true"
              />
              <p className="font-display text-lg font-semibold text-foreground">
                No dishes match “{query}”
              </p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Try a different dish name, or browse the full menu.
              </p>
              <Button
                type="button"
                variant="outline"
                data-ocid="menu.clear_search_button"
                onClick={() => {
                  setQuery("");
                  setActiveCategory("all");
                }}
                className="mt-2 rounded-full"
              >
                Clear search
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
