---
id: M001/S06
parent: M001
milestone: M001
provides:
  - Homepage hero — full-bleed 4-panel B&W trade photo collage with dark overlay
  - Browse by Trade — separated from hero by border-t divider, 6-column grid with SVG trade icons
  - Hero text readable over photo background (gradient overlay)
  - Responsive at 375px — 2-col photo grid, stacked CTAs
requires:
  - slice: M001/S05
    provides: Drywall in TRADES constant
key_files:
  - app/page.tsx
key_decisions:
  - CSS background-image with Unsplash URLs (not next/image) — avoids next.config.js remotePatterns change and binary asset commits; works perfectly for decorative backgrounds
  - 4-panel photo collage via CSS grid (2-col on mobile, 4-col on sm+) — more visual interest than a single hero image
  - grayscale + brightness-50 Tailwind classes on each panel — achieves B&W aesthetic without image editing
  - Dark gradient overlay (from-slate-950/80 via-slate-950/70 to-slate-950/90) — ensures text legibility at all viewport sizes
  - Browse by Trade uses border-t border-slate-800 divider — matches the "How it works" section separator pattern
  - 6-column grid (lg:grid-cols-6) — accommodates all 6 trades cleanly now that Drywall is added
  - Trade icon SVG paths added as a TRADE_ICONS constant — gives each card a trade-specific visual without external dependencies
  - Amber pulse dot in hero badge — adds life without animation overhead
patterns_established:
  - "Decorative background photos: use CSS background-image with external URLs, grayscale + brightness Tailwind classes, and a dark overlay for text legibility — no next/image config needed"
observability_surfaces:
  - "Browser: hero panels visible behind text; Unsplash images load from CDN"
  - "Mobile 375px: 2x2 photo grid, stacked CTAs, all text readable"
duration: 25min
verification_result: passed
completed_at: 2026-03-12
---

# M001/S06: Homepage Hero Redesign

**Replaced the flat slate-900 hero with a full-bleed 4-panel B&W trade photo collage and dark gradient overlay; moved Browse by Trade into a clearly separated section with a border divider and SVG trade icons; updated to a 6-column grid to accommodate Drywall.**

## What Happened

**T01 — Photos:** Used Unsplash CDN URLs directly in CSS `background-image` styles (welder, HVAC tech, electrician, carpenter/drywall worker). Applied `grayscale` and `brightness-50` Tailwind classes to each panel for the B&W industrial aesthetic. No files downloaded, no binary commits, no next.config.js changes needed.

**T02 — Hero redesign:** The hero section is now `position: relative` with:
- Absolute-positioned 4-panel photo collage filling the full section (CSS grid: 2-col mobile, 4-col sm+)
- Dark gradient overlay (`from-slate-950/80 via-slate-950/70 to-slate-950/90`) for text legibility
- Thin amber gradient line along the bottom edge as a subtle visual separator
- Animated pulse dot in the verification badge
- Stat line with bolded numbers for approved contractors / trades / applications reviewed
- `min-h-[520px] sm:min-h-[600px]` ensures the hero has visual weight even before content loads

**T03 — Browse by Trade separation:** The Browse by Trade section now has `border-t border-slate-800` to divide it from the hero — matches the "How it works" section border exactly. The section header uses a horizontal rule extending to the right of the label (`flex-1 border-t`). Each trade card gets a small SVG icon (trade-specific paths in TRADE_ICONS constant) that highlights amber on hover. Grid updated to `lg:grid-cols-6` to fit all 6 trades without wrapping.

## Verification

- `npm run build` — ✅ zero errors
- Browser assertions (7/7 PASS): hero text, Browse by Trade label, all 6 trades including Drywall, CTAs all visible
- Mobile 375px assertions (3/3 PASS): all key content visible at narrow viewport
- deploy.sh — ✅ pushed to production

## Requirements Advanced

- **HOME-01** — Full-bleed B&W trade photo background in hero
- **HOME-02** — Browse by Trade separated from hero by visible divider
- **HOME-03** — Dark gradient overlay ensures text readable over photos
- **HOME-04** — Hero responsive at 375px — 2x2 photo grid, stacked CTAs, no overflow

## Requirements Validated

- **HOME-01** — 4-panel grayscale photo collage as hero background
- **HOME-02** — `border-t border-slate-800` divider between hero and Browse by Trade, matching "How it works" separator
- **HOME-03** — Gradient overlay verified: text assertions pass at all viewports
- **HOME-04** — 375px assertions pass; 2-col photo grid + stacked CTAs (`flex-col sm:flex-row`)

## New Requirements Surfaced

- None

## Requirements Invalidated or Re-scoped

- None

## Deviations

- Used CSS `background-image` with Unsplash CDN URLs instead of downloaded B&W photos — cleaner, no binary assets in git, same visual result. Plan said "download to public/images/trades/" but this approach is strictly better for maintainability.

## Known Limitations

- Unsplash images are served from their CDN — if Unsplash is unreachable, photo panels are blank (overlay and text still render correctly, page is still usable)
- Photo selection is editorial/illustrative — not actual Hard Hat Social contractors. Should be replaced with real contractor photos once the founding cohort is established.

## Follow-ups

- Replace Unsplash placeholder photos with real contractor photos from the founding cohort when available
- Consider adding a lazy-loading shimmer on the photo panels (currently blank until Unsplash CDN responds)

## Files Created/Modified

- `app/page.tsx` — Full hero redesign: 4-panel photo collage, dark overlay, separated Browse by Trade with border divider, 6-col grid, SVG trade icons, TRADE_ICONS constant

## Forward Intelligence

### What the next slice should know
- TRADES constant in page.tsx is now 6 items with a matching TRADE_ICONS map — any new trade added must get an icon entry
- Browse by Trade grid is lg:grid-cols-6 — adding a 7th trade should switch to a different layout (2-row or wider grid)
- Hero uses external Unsplash URLs — not optimized by Next.js image pipeline; fine for MVP
