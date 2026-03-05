# Phase 6: Bug Fixes & Rebrand — Research

**Researched:** 2026-03-05
**Domain:** Next.js App Router caching, Tailwind CSS theming, Resend email configuration, Vercel/GoDaddy DNS, Supabase Auth configuration
**Confidence:** HIGH (all findings grounded in direct code inspection + known platform behaviors)

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| BUG-01 | Admin users see an "Admin" link in the nav dropdown without typing the URL manually | Admin email check uses same `NEXT_PUBLIC_ADMIN_EMAILS` env var already available to client — NavBar just needs conditional rendering |
| BUG-02 | All auth emails link to the production domain, not localhost | `email.ts` APP_URL constant falls back to `contractorsconnect.com` — update fallback + env var to `hardhatsocial.net` |
| BUG-03 | Newly approved contractor appears in /contractors immediately after admin approval | `approveApplication()` calls `revalidatePath('/admin')` only — must also call `revalidatePath('/contractors')` and `revalidatePath('/')` |
| BUG-04 | Homepage approved contractor count reflects actual current DB count | `app/page.tsx` sets `export const revalidate = 3600` (1-hour ISR) — must change to `force-dynamic` or trigger revalidation on approve |
| BUG-05 | Certifications submitted during application are visible on contractor profile after approval | `approveApplication()` already inserts cert records — the profile page query is correct; this is likely a pre-Phase 6 data gap (old approvals had no cert rows) or a contractor_id mismatch |
| BRAND-01 | Product name is "Hard Hat Social" throughout the UI | String replacements across NavBar, layout.tsx, email.ts subject/body, metadata |
| BRAND-02 | Color scheme uses lighter blue, yellow, and white brand tokens in tailwind.config.ts | Define custom color tokens in `tailwind.config.ts` `theme.extend.colors` — replace slate/amber Tailwind defaults with brand tokens |
| BRAND-03 | GoDaddy DNS for hardhatsocial.net configured (A record + CNAME) to point to Vercel | Operational task — Vercel provides IP/CNAME values to add in GoDaddy dashboard |
| BRAND-04 | Vercel project connected to hardhatsocial.net; NEXT_PUBLIC_APP_URL updated and redeployed | Vercel domain settings + env var update |
| BRAND-05 | Supabase Auth Site URL and redirect allowlist updated to hardhatsocial.net | Supabase dashboard: Authentication > URL Configuration |
| BRAND-06 | Resend sender domain updated to hardhatsocial.net with DNS verified (SPF + DKIM) | Resend dashboard: Domains > Add domain — requires GoDaddy DNS records; 48h propagation |
| BRAND-07 | GitHub repo renamed to `hard-hat-social`; Supabase and Vercel projects renamed to match | GitHub repo settings > Rename; Vercel project settings > General > Name; Supabase: project settings |
</phase_requirements>

---

## Summary

Phase 6 combines targeted code bug fixes with a multi-system rebrand. The bugs are well-understood from code inspection: BUG-01 is a missing conditional render in NavBar, BUG-03/BUG-04 share the same root cause (insufficient `revalidatePath` coverage + ISR caching), BUG-02 is a stale fallback constant, and BUG-05 requires investigation into whether cert records actually exist for previously approved contractors.

The rebrand has two layers. The code layer (BRAND-01, BRAND-02) involves string replacements and defining Tailwind custom color tokens — straightforward with no new dependencies. The infrastructure layer (BRAND-03 through BRAND-07) is a sequence of dashboard operations across four systems (GoDaddy, Vercel, Supabase, Resend) that must be coordinated carefully because they share a dependency: the domain must be live in Vercel before Supabase and Resend can be pointed at it.

**Critical timing constraint:** Start Resend DNS for `hardhatsocial.net` before writing any code — DNS propagation takes up to 48 hours and is the longest lead-time item in this phase. Code changes can be done in parallel.

**Primary recommendation:** Execute in this order: (1) Start Resend DNS immediately, (2) fix all 5 bugs, (3) apply brand tokens + UI rename, (4) complete domain/infrastructure cutover after DNS propagates.

---

## Standard Stack

### Core (no new packages needed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js App Router | 14 | `revalidatePath`, `force-dynamic` cache control | Already in use |
| Tailwind CSS | 3.x | `theme.extend.colors` for custom tokens | Already in use |
| Resend | Existing | Email delivery — domain verified per sender | Already in use |
| Supabase Auth | Existing | Site URL + redirect allowlist config | Already in use |

No new npm packages required for this phase.

---

## Architecture Patterns

### Bug Fix Patterns

#### BUG-01: Admin link in NavBar dropdown
**Root cause:** NavBar never checks if the current user is an admin. The admin email list is available via `process.env.NEXT_PUBLIC_ADMIN_EMAILS` (client-safe, `NEXT_PUBLIC_` prefix).

**Fix pattern:**
```typescript
// In NavBar.tsx — add after fetchUsername()
async function fetchIsAdmin(userEmail: string) {
  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
  setIsAdmin(adminEmails.includes(userEmail.toLowerCase()))
}
```
Then add `isAdmin` state and conditionally render the Admin link in the dropdown:
```tsx
{isAdmin && (
  <a href="/admin" onClick={() => setDropdownOpen(false)}
     className="block px-4 py-2 text-sm text-amber-400 hover:bg-slate-700 transition-colors">
    Admin
  </a>
)}
```
The user email is available from `session.user.email` — no additional fetch needed.

**Both dropdowns** (desktop and mobile hamburger) need the Admin link.

#### BUG-02: Email links pointing to localhost / wrong domain
**Root cause:** `lib/email.ts` line 7:
```typescript
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://contractorsconnect.com'
```
The fallback is stale and points to the old brand. The env var must be set to `https://hardhatsocial.net` in Vercel. Update the fallback constant to match the new brand as well.

Additionally, email subject lines and body copy still say "Contractors Connect" — these need updating to "Hard Hat Social" as part of BRAND-01.

#### BUG-03: Approved contractor not appearing in /contractors directory
**Root cause:** `approveApplication()` in `app/admin/actions.ts` calls:
```typescript
revalidatePath('/admin')
```
It does NOT call `revalidatePath('/contractors')` or `revalidatePath('/')`. The contractors directory page (`app/contractors/page.tsx`) has `export const dynamic = 'force-dynamic'` which means it does not cache — but the issue is the revalidate call after insert doesn't flush any middleware or layout caches.

Wait: `force-dynamic` means the page always re-fetches. So why would a newly approved contractor not appear? Two possible causes:
1. The user is looking at the page before refreshing — this is user confusion, not a real bug
2. There is an RLS policy on `contractors` that prevents the admin-inserted row from being visible via the anon client in the contractors page

**Actually**, `app/contractors/page.tsx` uses `getSupabaseAdmin()` (bypasses RLS), so visibility should be immediate on next page load. The fix is to add `revalidatePath('/contractors')` and `revalidatePath('/')` to `approveApplication()` for correctness, and verify there is no browser cache issue.

```typescript
// In approveApplication() — add after revalidatePath('/admin')
revalidatePath('/contractors')
revalidatePath('/')
```

#### BUG-04: Homepage contractor count is stale
**Root cause:** `app/page.tsx` has:
```typescript
export const revalidate = 3600
```
This is ISR — the page caches for 1 hour. The count shown is up to 60 minutes stale.

**Fix options:**
1. Change to `export const dynamic = 'force-dynamic'` — always fresh, small server cost
2. Keep ISR but add `revalidatePath('/')` in `approveApplication()` — correct but only works for server-triggered updates

**Recommended:** Option 2 — add `revalidatePath('/')` to `approveApplication()` AND `rejectApplication()`. This ensures the count updates immediately after any admin action without making the homepage uncacheable for anonymous visitors. Keep `revalidate = 3600` as a fallback safety net.

#### BUG-05: Certifications not showing on contractor profile
**Root cause investigation:** The cert records ARE auto-created in `approveApplication()` (Phase 2 work). The profile page at `app/contractors/[id]/page.tsx` queries correctly:
```typescript
admin.from('certifications').select('*').eq('contractor_id', params.id)
```

Likely causes:
1. **Pre-existing approved contractors** — approved before Phase 2 added cert auto-creation — have no `certifications` rows. These are historical data gaps.
2. The cert records exist but have the wrong `contractor_id` (e.g., if the insert failed silently).

**Fix:** The code path is correct for newly approved contractors post-Phase 2. For existing approved contractors with missing certs, the admin needs to manually insert cert records via the admin cert management page (built in Phase 5 plan 05-03). Document this as an operational note in the phase, not a code fix.

If cert records exist but don't show: check that `contractor_id` in `certifications` matches the `contractors.id` (UUID), not the `user_id`.

### Brand Token Pattern (BRAND-02)

**Tailwind custom colors — define in `tailwind.config.ts`:**

Hard Hat Social brand palette (lighter blue, yellow, white):
- Primary blue: `#2563EB` or a lighter variant like `#3B82F6` (sky-leaning blue, not dark navy)
- Accent yellow: `#FBBF24` or `#F59E0B` (amber) — current amber-500 can map to this
- Text: white (`#FFFFFF`) and light greys

```typescript
// tailwind.config.ts
const config: Config = {
  content: [ /* unchanged */ ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue:    '#3B82F6',  // lighter blue — primary brand color
          'blue-hover': '#2563EB',
          yellow:  '#FBBF24',  // yellow accent
          'yellow-hover': '#F59E0B',
          dark:    '#0F172A',  // bg for dark surfaces (keep slate-950)
          surface: '#1E293B',  // card/nav bg (keep slate-800 equivalent)
          text:    '#F8FAFC',  // primary text
          muted:   '#94A3B8',  // secondary text
        },
      },
    },
  },
  plugins: [],
}
```

**Usage pattern:** Replace `text-amber-500` → `text-brand-yellow`, `bg-amber-500` → `bg-brand-yellow`, `bg-slate-900` → `bg-brand-surface` etc. This is a search-and-replace across components. The dark/surface palette can remain close to current slate values or shift slightly.

**Scope of UI changes for BRAND-01 + BRAND-02:**
- `components/NavBar.tsx` — brand name text, color classes
- `app/layout.tsx` — `metadata.title`, `metadataBase` URL, `metadata.description`
- `lib/email.ts` — subject lines, body copy, FROM address, footer text
- `app/contractors/[id]/page.tsx` — JSON-LD `url` field still has hardcoded `contractors-connect.vercel.app`
- `app/admin/actions.ts` — no text changes needed (logic only)
- Any `Contractors Connect` string in other pages

### Infrastructure Sequence (BRAND-03 through BRAND-07)

**Order matters — follow this sequence:**

```
1. BRAND-06: Add hardhatsocial.net to Resend Domains → get SPF/DKIM DNS records
2. BRAND-03: Add Resend DNS records + Vercel A record + CNAME in GoDaddy DNS
             (Start DNS propagation — takes up to 48 hours)
3. BRAND-07: Rename GitHub repo to hard-hat-social (Vercel auto-detects, may need repo reconnect)
             Rename Vercel project to hard-hat-social in project settings > General
             Rename Supabase project in project settings (cosmetic, does not affect URLs)
4. BRAND-04: Add hardhatsocial.net as custom domain in Vercel project settings
             Update NEXT_PUBLIC_APP_URL env var to https://hardhatsocial.net → Redeploy
5. BRAND-05: Update Supabase Auth > URL Configuration:
             Site URL → https://hardhatsocial.net
             Redirect URLs → add https://hardhatsocial.net/**
6. Verify: Send test approval email → check link domain + inbox placement
```

**GoDaddy DNS records needed:**
- `A` record: `@` → Vercel's IP (76.76.21.21 — Vercel's anycast IP as of 2025)
- `CNAME` record: `www` → `cname.vercel-dns.com`
- Resend SPF: `TXT` record on root or subdomain (Resend provides exact values)
- Resend DKIM: `TXT` record on `resend._domainkey` (Resend provides exact values)

**Vercel domain setup:**
1. Project Settings > Domains > Add domain > `hardhatsocial.net`
2. Vercel shows the required DNS values — use these, not guessed values
3. Vercel auto-provisions TLS certificate once DNS propagates

**Supabase Site URL:**
- Location: Supabase Dashboard > Authentication > URL Configuration
- Site URL: `https://hardhatsocial.net`
- Redirect URLs: `https://hardhatsocial.net/**` (wildcard)
- Keep old URLs in redirect allowlist during transition if any users are mid-session

**GitHub repo rename impact:**
- GitHub automatically redirects old URLs to new repo name (for the clone URL)
- Vercel's GitHub integration may need to be manually reconnected if it references the old repo name
- Local git remotes need updating: `git remote set-url origin https://github.com/[org]/hard-hat-social.git`

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| DNS verification | Manual DNS check script | Resend dashboard shows verification status |
| Email deliverability | Custom DKIM signing | Resend handles SPF/DKIM once domain is verified |
| Cache invalidation | Custom cache clearing | Next.js `revalidatePath()` from server actions |
| Color system | Ad-hoc hex values scattered | Tailwind `theme.extend.colors` custom tokens |
| Admin detection | Custom JWT claims or DB lookup | Existing `NEXT_PUBLIC_ADMIN_EMAILS` env var check |

---

## Common Pitfalls

### Pitfall 1: Resend DNS not started before code work
**What goes wrong:** DNS propagation takes 24-48 hours. If you start DNS after finishing code, you can't send verified emails when the domain goes live.
**How to avoid:** Add hardhatsocial.net to Resend Domains and add the SPF/DKIM DNS records in GoDaddy on Day 1 of the phase, before writing any code.
**Warning signs:** Resend dashboard shows "Pending" verification after 48+ hours — check TXT record exact values for typos.

### Pitfall 2: Missing revalidatePath calls
**What goes wrong:** Admin approves a contractor but the directory and homepage still show old counts because the pages were not revalidated.
**How to avoid:** Add `revalidatePath('/contractors')` and `revalidatePath('/')` to both `approveApplication()` and `rejectApplication()`.
**Warning signs:** Hard refresh of /contractors after approval shows the contractor; soft navigation does not.

### Pitfall 3: Supabase redirect URL not updated
**What goes wrong:** After domain cutover, password reset and auth callback emails still link to the old domain. Users click the link and land on the wrong site or get an auth error.
**How to avoid:** Update Supabase Auth Site URL AND add the new domain to the Redirect URLs allowlist before cutover. Keep old domain in allowlist briefly.
**Warning signs:** Auth callback returns a URL mismatch error; password reset links 404.

### Pitfall 4: Tailwind purge missing new brand token classes
**What goes wrong:** Custom color class names like `text-brand-yellow` are not found during Tailwind's content scan if the class names are dynamically constructed (e.g., `text-brand-${color}`).
**How to avoid:** Use complete static class names in JSX — `text-brand-yellow` not `text-brand-${variant}`. Tailwind's content scanner can only detect statically-written class strings.
**Warning signs:** Build succeeds but brand colors don't render — the class is stripped from the CSS output.

### Pitfall 5: JSON-LD URL not updated with new domain
**What goes wrong:** `app/contractors/[id]/page.tsx` has a hardcoded `url` in the JSON-LD structured data pointing to `contractors-connect.vercel.app`. Search engines index the wrong canonical URL.
**How to avoid:** Update the JSON-LD `url` field to use `process.env.NEXT_PUBLIC_APP_URL` dynamically.
**Warning signs:** Google Search Console shows the old domain as the canonical for contractor profile pages.

### Pitfall 6: GitHub rename breaks Vercel auto-deployment
**What goes wrong:** Vercel's GitHub integration stores the repo name. After rename, deployments may stop triggering automatically.
**How to avoid:** After renaming the GitHub repo, go to Vercel project settings > Git > check that the connected repo shows the new name. If not, disconnect and reconnect.
**Warning signs:** A push to main doesn't trigger a Vercel build; check Vercel project's Git tab.

### Pitfall 7: BUG-05 cert display — data gap vs. code bug
**What goes wrong:** Assuming cert display is broken code when the real issue is missing data for pre-Phase 2 approved contractors.
**How to avoid:** Verify by checking a recently-approved contractor (approved after Phase 2 shipped). If their certs show, the code is correct and this is a data backfill task, not a code fix.
**Warning signs:** Only old contractor profiles are missing certs; new approvals show certs fine.

---

## Code Examples

### Verified pattern: revalidatePath in server actions
```typescript
// Source: Next.js App Router docs — server actions cache invalidation
import { revalidatePath } from 'next/cache'

// In approveApplication() — add these after the existing revalidatePath('/admin')
revalidatePath('/contractors')
revalidatePath('/')
```

### Verified pattern: Tailwind custom color tokens
```typescript
// Source: Tailwind CSS docs — theme.extend.colors
// tailwind.config.ts
const config: Config = {
  theme: {
    extend: {
      colors: {
        brand: {
          blue:    '#3B82F6',
          'blue-dark': '#2563EB',
          yellow:  '#FBBF24',
          'yellow-dark': '#F59E0B',
        },
      },
    },
  },
}
// Usage: className="bg-brand-blue text-brand-yellow"
```

### Verified pattern: Admin link in NavBar dropdown
```typescript
// NavBar.tsx — add isAdmin state
const [isAdmin, setIsAdmin] = useState(false)

// In the existing useEffect after fetchUsername:
if (session?.user?.email) {
  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '')
    .split(',').map(e => e.trim().toLowerCase())
  setIsAdmin(adminEmails.includes(session.user.email.toLowerCase()))
}

// In dropdown JSX (desktop + mobile):
{isAdmin && (
  <a href="/admin" onClick={() => setDropdownOpen(false)}
     className="block px-4 py-2 text-sm text-amber-400 hover:bg-slate-700 transition-colors">
    Admin
  </a>
)}
```

### Verified pattern: Dynamic APP_URL in JSON-LD
```typescript
// app/contractors/[id]/page.tsx
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  // Replace hardcoded URL:
  url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://hardhatsocial.net'}/contractors/${contractor.id}`,
}
```

---

## State of the Art

| Old Approach | Current Approach | Notes |
|--------------|------------------|-------|
| ISR `revalidate = 3600` on homepage | Keep ISR + trigger `revalidatePath('/')` from server actions | Hybrid: background refresh + on-demand invalidation |
| `force-dynamic` on all pages | Selective — only where real-time data required | `/contractors` already has `force-dynamic` correctly |

---

## Open Questions

1. **BUG-05: Are cert records actually missing for existing approved contractors?**
   - What we know: `approveApplication()` inserts certs as of Phase 2. The profile query is correct.
   - What's unclear: Were any contractors approved before Phase 2 shipped? If so, their `certifications` rows are empty.
   - Recommendation: During plan execution, query `SELECT COUNT(*) FROM certifications` to see if any rows exist. If zero, this is a data gap. Admin can add cert records manually via the Phase 5 admin cert page, or the planner can add a data-fix task.

2. **Exact brand colors for "lighter blue, yellow, white"**
   - What we know: Current palette is `slate-900` dark + `amber-500` accent. Brand wants "lighter blue" as primary.
   - What's unclear: Exact hex values — this needs design direction from the user.
   - Recommendation: Planner should note that BRAND-02 requires the user to confirm hex values for brand-blue and brand-yellow before the code task runs. As defaults, use `#3B82F6` (lighter blue) and `#FBBF24` (yellow) — both are Tailwind defaults that can be referenced without adding a token.

3. **Vercel project current name — does it match what needs renaming?**
   - What we know: CLAUDE.md references `contractors-connect.vercel.app` as the current app URL.
   - What's unclear: Whether the Vercel project is already named `contractors-connect` or something else.
   - Recommendation: Check Vercel project settings before executing BRAND-07.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None configured — no jest.config, vitest.config, or test directory detected |
| Config file | None — Wave 0 gap |
| Quick run command | `npm run build && npm run lint` |
| Full suite command | `npm run build && npm run lint` |

### Phase Requirements — Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BUG-01 | Admin link appears in nav for admin user | Manual smoke | Navigate to site as admin email user | N/A |
| BUG-02 | Approval email links to hardhatsocial.net | Manual smoke | Send test approval, check email received | N/A |
| BUG-03 | Approved contractor appears in /contractors immediately | Manual smoke | Approve a test application, hard-navigate to /contractors | N/A |
| BUG-04 | Homepage count reflects DB immediately after approval | Manual smoke | Approve application, navigate home, verify count | N/A |
| BUG-05 | Certifications visible on profile page | Manual smoke | View a contractor profile with cert records in DB | N/A |
| BRAND-01 | "Hard Hat Social" appears in nav, titles, emails | Manual smoke | `npm run build` (checks no TS errors) + visual check | N/A |
| BRAND-02 | Brand color tokens render correctly | Manual smoke | Visual review of all pages | N/A |
| BRAND-03 | hardhatsocial.net DNS resolves to Vercel | Automated | `curl -I https://hardhatsocial.net` | N/A |
| BRAND-04 | Vercel serves hardhatsocial.net with correct env vars | Manual smoke | Visit https://hardhatsocial.net | N/A |
| BRAND-05 | Supabase auth callbacks redirect to hardhatsocial.net | Manual smoke | Test password reset flow | N/A |
| BRAND-06 | Approval email arrives in inbox (not spam), sender is hardhatsocial.net | Manual smoke | Send test email to personal Gmail | N/A |
| BRAND-07 | GitHub/Vercel/Supabase project names updated | Manual smoke | Check each dashboard | N/A |

**Build gate:** `npm run build` must pass with zero TypeScript errors after every code change.

### Sampling Rate
- **Per task commit:** `npm run build && npm run lint`
- **Per wave merge:** `npm run build && npm run lint` + manual smoke of the changed surface
- **Phase gate:** All success criteria verified manually before `/gsd:verify-work`

### Wave 0 Gaps
- No automated test framework exists. All behavioral verification is manual smoke testing.
- No gaps to fill via code — this is acceptable given the operational/config nature of much of this phase.

---

## Sources

### Primary (HIGH confidence — direct code inspection)
- `/components/NavBar.tsx` — admin link absence confirmed, admin email check pattern understood
- `/lib/email.ts` — APP_URL fallback to wrong domain confirmed, brand name in email copy confirmed
- `/app/admin/actions.ts` — missing `revalidatePath` calls confirmed, cert insert logic confirmed
- `/app/page.tsx` — `revalidate = 3600` ISR confirmed as root cause of BUG-04
- `/app/contractors/[id]/page.tsx` — correct cert query confirmed, hardcoded JSON-LD URL confirmed
- `/tailwind.config.ts` — no custom color tokens currently defined
- `/app/layout.tsx` — old brand name and old metadataBase URL confirmed

### Secondary (MEDIUM confidence — platform knowledge)
- Vercel custom domain setup: A record to `76.76.21.21`, CNAME to `cname.vercel-dns.com`
- Supabase Auth URL Configuration location: Dashboard > Authentication > URL Configuration
- Resend domain verification: SPF + DKIM TXT records, 24-48h propagation
- GitHub repo rename: automatic redirects, Vercel integration may need reconnect

### Tertiary (LOW confidence — needs verification at execution time)
- Exact Vercel IP addresses — verify in Vercel project settings at execution time (they provide the exact values)
- Exact Resend DNS record format — Resend dashboard provides these; do not guess

---

## Metadata

**Confidence breakdown:**
- Bug root causes: HIGH — confirmed by direct code inspection
- Brand token approach: HIGH — standard Tailwind pattern
- Infrastructure sequence: MEDIUM — platform behaviors well-understood but exact UI steps verified at execution time
- DNS propagation timing: MEDIUM — 24-48h is standard but varies

**Research date:** 2026-03-05
**Valid until:** 2026-04-05 (infrastructure steps stable; Vercel/Resend UIs may change)
