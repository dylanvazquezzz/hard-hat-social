# M001/S06: Homepage Hero Redesign — UAT

**Milestone:** M001
**Written:** 2026-03-12

## UAT Type

- UAT mode: live-runtime (browser assertions)
- Why this mode is sufficient: Visual verification requires a browser. Assertions confirm content, structure, and mobile layout. Photo rendering depends on Unsplash CDN availability — verified that page is usable even if photos fail (overlay + text still render).

## Preconditions

- No auth required — homepage is public
- Unsplash CDN accessible from test environment

## Smoke Test

Navigate to `http://localhost:3000` (or hardhatsocial.net). Confirm: trade photos visible behind hero text, "Apply as a Contractor" button prominent, Browse by Trade section separated by a visible line, all 6 trades shown with icons.

## Test Cases

### 1. Hero photo panels visible

1. Navigate to `/`
2. **Expected:** 4 photo panels fill the hero background; photos appear in grayscale/dark; trade workers visible (welder, HVAC, electrician, carpenter)

### 2. Hero text readable

1. View the hero section
2. **Expected:** "The verified network for all tradespeople" clearly readable; "Apply as a Contractor" and "Browse Directory" buttons both visible and clickable; amber verification badge visible at top

### 3. Browse by Trade visually separated

1. Scroll past the hero
2. **Expected:** A visible horizontal border line separates the hero from the Browse by Trade section; "BROWSE BY TRADE" label with extending rule visible

### 4. All 6 trades in Browse by Trade grid

1. View the Browse by Trade section
2. **Expected:** 6 cards visible: Welding, HVAC, Electrical, Plumbing, General Contractor, Drywall — each with a small SVG icon

### 5. Trade card hover state

1. Hover over any trade card
2. **Expected:** Border color transitions to amber tint; icon turns amber; text color transitions to amber

### 6. Trade card links

1. Click "Welding" in Browse by Trade
2. **Expected:** Navigates to `/contractors?trade=Welding`

### 7. Mobile layout — 375px

1. Set viewport to 375px wide
2. Navigate to `/`
3. **Expected:** Photo panels show as 2x2 grid; hero text readable; CTAs stack vertically; no horizontal overflow; Browse by Trade shows 2-column grid

### 8. How it works still separated

1. Scroll to "How it works" section
2. **Expected:** Border-t divider between Browse by Trade and How it works sections remains (unchanged from before)

## Edge Cases

### Photos fail to load

1. Disable network or block Unsplash domain
2. Navigate to `/`
3. **Expected:** Photo panels are blank/dark; gradient overlay still renders; all text and CTAs still readable and functional

## Failure Signals

- Hero has flat slate-900 background with no photos — Unsplash URLs failing or CSS not applied
- Browse by Trade immediately follows hero with no visual separation — divider border missing
- Only 5 trade cards visible — Drywall missing from TRADES array
- Trade icons not rendering — SVG path data incorrect or missing from TRADE_ICONS
- Text unreadable at 375px — overlay insufficient or layout overflow

## Requirements Proved By This UAT

- **HOME-01** — Full-bleed B&W trade photo background (test case 1) ✅ (7/7 browser assertions passed)
- **HOME-02** — Browse by Trade separated by visible divider (test case 3) ✅
- **HOME-03** — Text readable over photos (test case 2) ✅
- **HOME-04** — Responsive at 375px (test case 7) ✅ (3/3 mobile assertions passed)

## Not Proven By This UAT

- Photo rendering on production Vercel (CDN caching, CORS) — Unsplash URLs are public, should work; verify on hardhatsocial.net
- Long-term Unsplash URL stability — photos should be replaced with owned assets before launch

## Notes for Tester

- The photos are illustrative placeholders from Unsplash — the specific subjects may not match the expected trades exactly (e.g., "carpenter" panel covers drywall/general work)
- The hero `min-h` means it always has height even if photos are slow to load
