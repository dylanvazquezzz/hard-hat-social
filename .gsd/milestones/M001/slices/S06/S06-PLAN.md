# S06: Homepage Hero Redesign

**Slice goal:** The hero section has a full-bleed black-and-white trade photo background. "Browse by Trade" becomes a clearly separated section below with a divider line.

**Requirements:** HOME-01, HOME-02, HOME-03, HOME-04

**Depends on:** S05

## Tasks

- [ ] **T01: Source and add trade photos** — Find free-license B&W photos of HVAC technicians, welders, plumbers, drywall workers, and electricians (Unsplash or similar). Download and add to public/images/trades/. Aim for 5 photos that can be composited or used as a collage/grid behind the hero.

- [ ] **T02: Redesign hero section with photo background** — Update app/page.tsx hero section: add the trade photos as a background (CSS grid collage, or single blended image), apply a dark overlay (bg-black/60 or similar) so text stays readable, ensure the headline and CTAs remain prominent. Test at mobile viewport (375px).

- [ ] **T03: Separate Browse by Trade with divider** — Add a visible horizontal divider (border-t or a styled hr) between the hero section and the Browse by Trade section, matching the visual separation used between Browse by Trade and How it Works. Browse by Trade should feel like its own distinct section.

## Completion Criteria

- [ ] Hero section has trade photos visible behind the headline
- [ ] Dark overlay makes "The verified network for all tradespeople" fully readable
- [ ] Browse by Trade is separated from the hero by a visible divider line
- [ ] Browse by Trade has the same visual separation style as How it Works
- [ ] Layout looks correct on mobile (375px) — no overflow, text readable
- [ ] `npm run build` passes
