# Project Guidance

## User Preferences

- Restaurant name: DUM | The Royal Biryani Kitchen
- Cuisine: Biryani / Indian restaurant
- Rating 4.6 with about 1,024 reviews
- Price range ₹400–1,600 per person
- Tags: Happy-hour food, Vegetarian options, Kids' menu
- Hours: Open, closes 2 am
- Address: 35, 80 Feet Rd, HAL 3rd Stage, Indiranagar, Bengaluru, Karnataka 560075
- Phone: 099000 06552
- Warm, premium Indian restaurant aesthetic with distinctive typography
- Menu shows no per-dish prices

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `pnpm fix`
- **build**: `pnpm build`

## Learnings

- Tailwind v3 OKLCH token pattern: a CSS custom property in index.css does not create a utility — every semantic color (e.g. success) must also be registered in tailwind.config.js theme.extend.colors as `oklch(var(--token) / <alpha-value>)` or bg-/text-/border- classes and opacity modifiers silently generate no CSS.
- Motoko has no triple-quoted string literals; build multi-line doc strings from single-line literals concatenated with `#` and explicit \n escapes.
- ArrayEntity.toEntity<T> takes an implicit _toRow argument, so T cannot be inferred from the array alone — call it with explicit type instantiation or moc reports M0098.
- OQL entities can be registered over static module arrays (not just actor stable fields) via ArrayEntity.toEntity; expose the arrays through public module accessors so main.mo can call .toEntity on them, and use .public_() for public marketing content.
- Biome's noUnusedTemplateLiteral is an unsafe fix, so `pnpm fix` exits 1 and skips it; convert the template literal to a plain string manually to clear the pipeline.
- Biome rejects role="dialog" on a div and onClick on non-interactive elements; use the shadcn Dialog primitive (Radix) for lightboxes and full-bleed backdrop buttons instead of stopPropagation handlers.
- Generated image filenames include .dim_WxH before the extension; reference them exactly as returned by generate_image.
- Backend Photo.imageRef values are stable slugs, not fetchable URLs; the frontend must map each slug to a generated asset path before rendering.
- Biome's noUnusedVariables fix is unsafe, so `pnpm fix` exits 1 and skips it; rename the unused parameter to `_name` manually to clear the pipeline.
- The reservation backend returns an empty list (not an error) for non-staff callers, so the staff page gates on isAuthenticated client-side as well as server-side.
- OQL auto-derivation over a record with a ?Text or variant field needs a top-level <Type>Value.mo module defining _toRow for that exact type, imported top-level in the file that declares entities.
- MapEntity.toEntity<K, V> takes the Map receiver first and both type params must be explicit or moc reports M0098.
- AccessControl.getUserRole traps for an unregistered non-anonymous caller; read accessControlState.userRoles.get(caller) directly and treat null as not-staff.
- caffeineai-email 0.2.0 exposes EmailClient.sendServiceEmail(fromUsername, recipients, subject, htmlBody) returning #ok | #err(Text).
