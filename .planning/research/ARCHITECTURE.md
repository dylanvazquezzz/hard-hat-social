# Architecture Research

**Domain:** Verified contractor directory — Next.js 14 App Router
**Researched:** 2026-03-01
**Confidence:** HIGH (based on official Next.js docs verified 2026-02-27 + direct codebase inspection)

---

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                    Browser / Client                              │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  NavBar    │  │SearchFilters │  │    ContactSection        │  │
│  │ 'use client'│  │ 'use client' │  │    'use client'          │  │
│  │ auth state │  │ URL push     │  │ fetches /api/contact     │  │
│  └────────────┘  └──────────────┘  └──────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
         │                │                      │
         │ (hydration)    │ (searchParams)        │ (fetch with Bearer)
         ▼                ▼                      ▼
┌──────────────────────────────────────────────────────────────────┐
│               Next.js App Router — Server Layer                  │
│                                                                  │
│  ┌──────────┐  ┌──────────────┐  ┌──────────┐  ┌─────────────┐  │
│  │page.tsx  │  │[id]/page.tsx │  │explore/  │  │admin/       │  │
│  │(SC)      │  │(SC)          │  │page.tsx  │  │page.tsx     │  │
│  │Homepage  │  │Profile detail│  │(SC)      │  │(SC)         │  │
│  └──────────┘  └──────────────┘  └──────────┘  └─────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │              Route Handlers (API)                        │    │
│  │   /api/contact/[id]  — protected, approved-only          │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │              Layout Guards                               │    │
│  │  contractors/layout.tsx — auth check (client)            │    │
│  │  admin/layout.tsx      — admin email check (client)      │    │
│  └──────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
         │
         │ (supabase-admin / service role)
         ▼
┌──────────────────────────────────────────────────────────────────┐
│                       Supabase                                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌───────────┐  │
│  │contractors │  │certific-   │  │applications│  │ profiles  │  │
│  │(RLS)       │  │ations (RLS)│  │(RLS)       │  │ (RLS)     │  │
│  └────────────┘  └────────────┘  └────────────┘  └───────────┘  │
│                                                                  │
│  ┌────────────┐  ┌──────────────────────────────────────────┐   │
│  │  posts     │  │  Storage: avatars / post-images /         │   │
│  │  (RLS)     │  │           application-docs                │   │
│  └────────────┘  └──────────────────────────────────────────┘   │
│                                                                  │
│  Auth (supabase.auth) — JWT tokens, sessions, email OTP          │
└──────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Type | Responsibility | Communicates With |
|-----------|------|---------------|-------------------|
| `app/layout.tsx` | Server | Root shell, global metadata title template, NavBar | All pages |
| `app/page.tsx` | Server (static) | Homepage hero, trade links, how-it-works, CTA | None (no data fetch currently) |
| `app/contractors/layout.tsx` | Client | Auth guard — redirects unauthenticated to /auth | supabase.ts (browser client) |
| `app/contractors/page.tsx` | Server (force-dynamic) | Directory grid + jobs feed, reads searchParams | supabase-admin.ts |
| `app/contractors/[id]/page.tsx` | Server (force-dynamic) | Contractor profile, certifications, contact gating | supabase-admin.ts, ContactSection |
| `app/admin/layout.tsx` | Client | Admin email guard — checks NEXT_PUBLIC_ADMIN_EMAILS | supabase.ts |
| `app/admin/page.tsx` | Server | Application review queue | supabase-admin.ts |
| `app/admin/actions.ts` | Server Action | approveApplication, rejectApplication | supabase-admin.ts, email.ts |
| `app/explore/page.tsx` | Server (force-dynamic) | Social + Q&A feed with example posts fallback | supabase-admin.ts |
| `app/u/[username]/page.tsx` | Server (force-dynamic) | Public profile — profile + contractor + posts + certs | supabase-admin.ts |
| `app/api/contact/[id]/route.ts` | Route Handler | Protected endpoint — verifies JWT, checks approved status, returns phone/email | supabase-admin.ts |
| `components/NavBar.tsx` | Client | Auth-aware nav, username dropdown, sign out | supabase.ts (auth state) |
| `components/SearchFilters.tsx` | Client | Filter UI — pushes URL params to trigger server re-fetch | useRouter, useSearchParams |
| `components/ContactSection.tsx` | Client | Fetches contact info via /api/contact/[id] with Bearer token | /api/contact/[id] |
| `components/ContractorCard.tsx` | Server-compatible | Card display in directory grid | Props only |
| `components/ProfileHeader.tsx` | Server-compatible | Profile photo, name, trade, location | Props only |
| `components/CertificationBadge.tsx` | Server-compatible | Cert display with verified/expired status | Props only |
| `components/PostCard.tsx` | Server-compatible | Social post card | Props only |
| `lib/supabase.ts` | Browser client | Client-side Supabase access — respects RLS | Used by 'use client' components |
| `lib/supabase-admin.ts` | Server-only | Service role client — bypasses RLS for server fetches | Used only in Server Components and Route Handlers |
| `lib/email.ts` | Server-only | Resend — approval/rejection emails | admin/actions.ts |
| `lib/types.ts` | Shared | TypeScript interfaces: Contractor, Certification, Application, Profile, Post | All files |

---

## Recommended Project Structure

The existing structure is correct and complete. The additions for this milestone slot in cleanly:

```
contractors-connect/
├── app/
│   ├── layout.tsx                    # Add title template: '%s | Contractors Connect'
│   │                                 # Add metadataBase for OG image URLs
│   ├── page.tsx                      # Homepage redesign — add server Supabase fetch for teaser profiles
│   │                                 # Add static metadata export
│   ├── contractors/
│   │   ├── layout.tsx                # Existing auth guard (unchanged)
│   │   ├── loading.tsx               # NEW — skeleton for directory grid (loading.js convention)
│   │   └── [id]/
│   │       ├── page.tsx              # Add generateMetadata() for contractor name/trade/location
│   │       │                         # Add JSON-LD script tag (LocalBusiness or Person schema)
│   │       └── loading.tsx           # NEW — skeleton for profile page
│   ├── explore/
│   │   └── loading.tsx               # NEW — skeleton for feed
│   ├── u/
│   │   └── [username]/
│   │       ├── page.tsx              # Add generateMetadata() for username
│   │       └── loading.tsx           # NEW — skeleton for public profile
│   ├── admin/
│   │   └── contractors/
│   │       └── [id]/page.tsx         # Existing cert management page
│   └── api/
│       └── contact/[id]/route.ts     # Unchanged
├── components/
│   ├── NavBar.tsx                    # Mobile nav improvement — hamburger / bottom bar
│   ├── skeletons/                    # NEW directory for skeleton components
│   │   ├── ContractorCardSkeleton.tsx
│   │   ├── DirectoryGridSkeleton.tsx
│   │   └── ProfileSkeleton.tsx
│   └── [existing components unchanged]
└── lib/
    └── [existing files unchanged]
```

### Structure Rationale

- **loading.tsx files:** Next.js App Router's `loading.js` convention automatically wraps `page.js` in a `<Suspense>` boundary. Place `loading.tsx` at the route segment level (same folder as `page.tsx`) — no manual Suspense wrappers needed for full-page loading states.
- **skeletons/ directory:** Isolate skeleton components from real components. Skeletons are purely presentational and have no data dependencies. Keep them adjacent to components/ not inside app/.
- **generateMetadata in page.tsx only:** The function can only export from Server Components. It cannot coexist with `export const metadata` in the same file. For dynamic routes like `/contractors/[id]`, use `generateMetadata` and fetch contractor data — Next.js automatically memoizes the same fetch call shared between `generateMetadata` and the default export.
- **JSON-LD in page.tsx return:** Not a metadata field. Render as `<script type="application/ld+json">` directly in the page JSX. For contractor profiles, use `Person` or `LocalBusiness` schema.org type.

---

## Architectural Patterns

### Pattern 1: Server Component with Admin Client (force-dynamic)

The dominant data fetching pattern in this codebase. All pages that read from Supabase use the admin client (service role) from a Server Component. The `force-dynamic` directive prevents Next.js from caching the response, which is correct for search results and authenticated feeds.

**When to use:** Any page that reads from Supabase and should always show fresh data.

```typescript
// app/contractors/page.tsx — existing pattern, correct
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export default async function ContractorsPage({ searchParams }: PageProps) {
  const admin = getSupabaseAdmin()
  const { data } = await admin
    .from('contractors')
    .select('...')
    .eq('status', 'approved')

  return <div>...</div>
}
```

**Trade-offs:** Zero caching means every page load hits Supabase. Acceptable at current scale (< 500 contractors). For the homepage teaser, consider caching with `revalidate: 300` since teaser profiles don't change often.

### Pattern 2: generateMetadata with Shared Data Fetch

For dynamic contractor profile pages, `generateMetadata` needs the same contractor data as the page component. Next.js automatically deduplicates the fetch — call `getSupabaseAdmin()` in both and make the same query; it will only run once.

**When to use:** Any dynamic route (`[id]`, `[username]`) needing SEO metadata.

```typescript
// app/contractors/[id]/page.tsx
import type { Metadata } from 'next'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const admin = getSupabaseAdmin()
  const { data: contractor } = await admin
    .from('contractors')
    .select('full_name, trade, location_city, location_state')
    .eq('id', params.id)
    .eq('status', 'approved')
    .single()

  if (!contractor) return { title: 'Contractor Not Found' }

  return {
    title: `${contractor.full_name} — ${contractor.trade}`,
    description: `Verified ${contractor.trade} contractor in ${contractor.location_city}, ${contractor.location_state}.`,
    openGraph: {
      title: `${contractor.full_name} | Contractors Connect`,
      description: `Verified ${contractor.trade} contractor in ${contractor.location_city}, ${contractor.location_state}.`,
      type: 'profile',
    },
  }
}

export default async function ContractorProfilePage({ params }: { params: { id: string } }) {
  // Same query — Next.js deduplicates the fetch automatically
  const admin = getSupabaseAdmin()
  const { data: contractor } = await admin
    .from('contractors')
    .select('...')
    .eq('id', params.id)
    .eq('status', 'approved')
    .single()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: contractor.full_name,
    jobTitle: contractor.trade,
    address: {
      '@type': 'PostalAddress',
      addressLocality: contractor.location_city,
      addressRegion: contractor.location_state,
    },
  }

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      {/* rest of page */}
    </div>
  )
}
```

### Pattern 3: loading.tsx — Route-Level Skeleton

`loading.tsx` placed in the same directory as `page.tsx` is automatically wrapped by Next.js in a `<Suspense>` boundary. It shows immediately on navigation before the async Server Component resolves.

**When to use:** Any route with a slow Supabase fetch (directory, profile, explore, public profile).

```typescript
// app/contractors/loading.tsx
import { DirectoryGridSkeleton } from '@/components/skeletons/DirectoryGridSkeleton'

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-800" />
        <div className="mt-2 h-4 w-32 animate-pulse rounded bg-slate-800" />
      </div>
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-56">
          <div className="h-64 animate-pulse rounded-lg bg-slate-900" />
        </aside>
        <DirectoryGridSkeleton />
      </div>
    </div>
  )
}
```

### Pattern 4: Client Component for Browser-Only Interactions

Three client components handle browser-specific concerns. They sit at the leaf of the component tree (not wrapping large subtrees), minimizing the client bundle.

**When to use:** Auth state subscription (NavBar), URL manipulation (SearchFilters), authenticated API calls with JWT (ContactSection).

```typescript
// The existing pattern is correct:
// - 'use client' at top of file
// - Import from lib/supabase.ts (browser client, not admin)
// - Minimal logic: auth state, router.push, fetch with Bearer token
```

---

## Data Flow

### Request Flow: Directory Page

```
User navigates to /contractors?trade=Welding&state=TX
    ↓
contractors/layout.tsx (Client) — checks Supabase auth session
    ↓ (if authenticated)
contractors/loading.tsx — renders skeleton immediately (streaming)
    ↓ (async, concurrent)
contractors/page.tsx (Server Component)
    → getSupabaseAdmin() — service role client
    → .from('contractors').eq('status', 'approved').eq('trade', 'Welding')...
    → Supabase Postgres (RLS bypassed by admin client)
    ← contractors[] + posts[]
    → renders ContractorCard[] + SearchFilters
    ↓
Browser receives streamed HTML — skeleton swaps to real content
    ↓
SearchFilters hydrates as Client Component
    → user changes state filter
    → router.push('/contractors?trade=Welding&state=TX')
    → triggers new server render (force-dynamic, no cache)
```

### Request Flow: Contact Info (Security Critical)

```
User views /contractors/[id] (Server Component renders page)
    ↓
ContactSection renders (Client Component, 'use client')
    ↓
supabase.auth.getSession() — gets JWT from browser
    ↓
fetch('/api/contact/[id]', { Authorization: 'Bearer <jwt>' })
    ↓
app/api/contact/[id]/route.ts (Route Handler, server)
    → admin.auth.getUser(token) — verifies JWT with Supabase
    → admin.from('contractors').eq('user_id', user.id).eq('status', 'approved')
    → if not approved → 403 Forbidden
    → if approved → returns { phone, email }
    ↓
ContactSection displays contact info or auth prompt
```

**Why this pattern is correct:** RLS alone cannot stop a logged-in non-approved user from seeing contact info if the query runs on the server. The API route enforces the approved-only check at the application layer with an explicit status check before returning data.

### Request Flow: SEO Metadata (New Addition)

```
Google/social crawler hits /contractors/[id]
    ↓
Next.js runs generateMetadata() — fetches contractor from Supabase
    ↓
For HTML-limited bots (Twitterbot, Facebookbot):
    → metadata blocks page render; goes into <head> of initial HTML
For JavaScript-capable bots (Googlebot):
    → metadata streams in after initial UI (streaming metadata, Next.js 15.2+)
    ↓
JSON-LD <script> is included in server-rendered page HTML
    → Googlebot reads structured data for rich results (name, trade, location)
```

### State Management

There is no global state management library. State lives in:

1. **URL search params** — filter state for the directory (trade, state, q). SearchFilters reads and writes these. Server Component re-renders on navigation.
2. **React useState in Client Components** — NavBar (session, username, dropdown), SearchFilters (input text), ContactSection (status, contact data).
3. **Supabase session** — managed by Supabase Auth client. NavBar subscribes via `onAuthStateChange`. Layout guards check via `getSession()`.

No shared state store needed at current scope.

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Supabase Postgres | `supabase-admin.ts` in Server Components, `supabase.ts` in Client Components | Never mix clients — admin client bypasses RLS |
| Supabase Auth | Browser client `supabase.auth.*` in 'use client' components | JWT verified server-side in route handlers via `admin.auth.getUser(token)` |
| Supabase Storage | Browser client for uploads (avatars, post-images) from profile page; Admin client for application-docs | Bucket policies: avatars and post-images public read, authenticated write |
| Resend | `lib/email.ts` called from `app/admin/actions.ts` (Server Action) | Server-only; never called from client |
| Vercel | Hosting — env vars set via Vercel dashboard, not committed to repo | `NEXT_PUBLIC_*` vars available client-side; `SUPABASE_SERVICE_ROLE_KEY` and `RESEND_API_KEY` server-only |

### Internal Boundaries

| Boundary | Communication | Rule |
|----------|---------------|------|
| Server Components ↔ Client Components | Props only (data passed down, no callbacks up) | Do not pass non-serializable objects (functions, class instances) as props from server to client |
| Client Components ↔ Supabase | lib/supabase.ts only | Never import supabase-admin.ts in a 'use client' file — it leaks the service role key |
| Server Components ↔ Supabase | lib/supabase-admin.ts for data reads; lib/supabase.ts only when reading auth from headers/cookies | Prefer admin client for all server-side reads (consistent, bypasses RLS safely for approved-only queries) |
| Admin actions ↔ Email | lib/email.ts | Server Action calls Resend — never from client, never expose Resend API key |
| ContactSection ↔ Contact Data | HTTP via /api/contact/[id] | Never fetch contact info directly from client — always through the route handler that enforces approved status |

---

## Build Order for This Milestone

Dependencies between the items in scope determine the correct implementation order:

### Phase 1: Foundation (no dependencies, unblock everything else)

1. **`app/layout.tsx`** — Add `metadataBase` and title template `'%s | Contractors Connect'`
   - Unblocks: All `generateMetadata` on child pages (OG image URLs resolve correctly only after `metadataBase` is set)
   - No data dependency, purely config

2. **Skeleton components** (`components/skeletons/`)
   - Create `ContractorCardSkeleton`, `DirectoryGridSkeleton`, `ProfileSkeleton`
   - No data dependency, purely presentational
   - Unblocks: All `loading.tsx` files

### Phase 2: Data Layer Changes (depends on Phase 1)

3. **`app/page.tsx` homepage redesign**
   - Change from static to server component with Supabase fetch for teaser profiles
   - Add static `metadata` export (title, description, OG)
   - Add `export const revalidate = 300` (not `force-dynamic` — teaser profiles change infrequently)
   - This is the chicken-and-egg solution: show placeholder profiles until real ones exist

### Phase 3: SEO on Existing Pages (depends on Phase 1)

4. **`app/contractors/[id]/page.tsx`** — Add `generateMetadata` + JSON-LD
   - Reads same data as the existing page (auto-deduplicated)
   - Add `Person` schema.org JSON-LD script tag in return JSX

5. **`app/u/[username]/page.tsx`** — Add `generateMetadata`
   - Reads same profile data as existing page
   - No JSON-LD needed (social posts don't benefit from structured data)

6. **`app/contractors/page.tsx`** — Add static `metadata` export
   - `title: 'Contractor Directory'` (inherits template from layout)
   - No `generateMetadata` needed (page is not unique per contractor)

### Phase 4: UX Polish (depends on Phase 1 skeletons)

7. **`app/contractors/loading.tsx`** — Directory skeleton
8. **`app/contractors/[id]/loading.tsx`** — Profile skeleton
9. **`app/explore/loading.tsx`** — Feed skeleton
10. **`app/u/[username]/loading.tsx`** — Public profile skeleton
11. **Empty states** — already partially implemented in contractors/page.tsx; verify all pages have them
12. **Mobile nav** — modify `components/NavBar.tsx` to add hamburger menu or mobile-optimized layout

### Phase 5: Production Hardening (no code changes, operational)

13. **Vercel env vars** — verify all 6 vars set in production project
14. **Supabase Storage buckets** — verify `avatars`, `post-images`, `application-docs` exist with correct policies
15. **Resend domain DNS** — add SPF/DKIM records so emails don't land in spam

---

## Anti-Patterns

### Anti-Pattern 1: Importing supabase-admin in Client Components

**What people do:** Import `getSupabaseAdmin()` from a 'use client' file, or export it without a server-only guard.
**Why it's wrong:** Next.js bundles 'use client' files into the browser bundle. The service role key (which bypasses all RLS) would be exposed to any user who inspects the bundle.
**Do this instead:** Only import `supabase-admin.ts` in files that are guaranteed server-only: Server Components, Route Handlers, Server Actions. The current codebase does this correctly — preserve this pattern.

### Anti-Pattern 2: Client-Side Auth Guard as Security Layer

**What people do:** Rely on `contractors/layout.tsx` (client component auth check) as the security enforcement for contact info.
**Why it's wrong:** Client-side guards prevent navigation but do not prevent direct API calls. A user can bypass the guard by hitting `/api/contact/[id]` directly with any JWT.
**Do this instead:** The current codebase already has the correct pattern — the Route Handler (`/api/contact/[id]`) independently verifies JWT and checks approved status. The client layout guard is UX only (prevents useless page loads). This two-layer approach is correct and must be preserved.

### Anti-Pattern 3: Fetching All Data in Root Layout

**What people do:** Move data fetching into `app/layout.tsx` to share data across pages (avoid repeat fetches).
**Why it's wrong:** Layout data is cached per-request, but it also prevents incremental streaming. More importantly, layout.tsx cannot use `searchParams` (which filters directory results). Each page must fetch its own data.
**Do this instead:** Use `generateMetadata` deduplication for metadata + page data. Use React cache() for helper functions if the same fetch is needed in multiple Server Components in the same render tree.

### Anti-Pattern 4: Using force-dynamic on the Homepage

**What people do:** Add `export const dynamic = 'force-dynamic'` to the homepage because "it has data."
**Why it's wrong:** The homepage teaser profiles change at most once per approval cycle (hours or days). Forcing dynamic rendering means every visitor waits for a Supabase round-trip before seeing any content.
**Do this instead:** Use `export const revalidate = 300` (5 minutes). The homepage re-validates its data every 5 minutes via ISR, not on every request. If no approved contractors exist yet, the hardcoded placeholder/teaser section shows immediately.

### Anti-Pattern 5: One Suspense Boundary Around the Entire Page

**What people do:** Wrap `<main>` in a single `<Suspense>` so the whole page shows a spinner.
**Why it's wrong:** Users see nothing useful until all data resolves. The directory page fetches both contractor cards AND job posts — if one is slow, both are blocked.
**Do this instead:** Use `loading.tsx` (full page skeleton that streams immediately), and for pages with independent sections (directory + jobs), consider wrapping each section in its own `<Suspense>` with a component-level data fetch so they stream independently.

---

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-500 contractors | Current approach is fine. `force-dynamic` + admin client. No caching layer needed. |
| 500-5K contractors | Add pagination (cursor-based, not offset) to directory page. Supabase full-text search index (already in migration 005) handles keyword search. Add `revalidate` to explore/jobs feed instead of force-dynamic. |
| 5K-50K contractors | Add Supabase connection pooling (PgBouncer). Consider ISR for contractor profile pages (profiles change rarely after approval). Evaluate Supabase Edge Functions for contact info endpoint to reduce cold start latency. |
| 50K+ contractors | Re-evaluate directory search — Supabase full-text search may need supplement (Algolia, Typesense). Split admin into separate Next.js app or dedicated service. |

### Scaling Priorities

1. **First bottleneck:** Directory page performance as contractor count grows. Supabase query without pagination will be slow past 1K rows. Fix with cursor-based pagination before launch.
2. **Second bottleneck:** Supabase connection limits. Default free tier allows 60 connections. PgBouncer (transaction pooling) multiplies effective connections. Switch when connection errors appear in Vercel logs.

---

## Sources

- Next.js generateMetadata official docs: https://nextjs.org/docs/app/api-reference/functions/generate-metadata (verified 2026-02-27)
- Next.js JSON-LD guide: https://nextjs.org/docs/app/guides/json-ld (verified 2026-02-27)
- Next.js loading.js convention: https://nextjs.org/docs/app/api-reference/file-conventions/loading (verified 2026-02-27)
- Codebase inspection: `/Users/dylanvazquez/Desktop/contractors-connect/` (direct read, 2026-03-01)

---
*Architecture research for: Contractors Connect — Next.js 14 App Router verified contractor directory*
*Researched: 2026-03-01*
