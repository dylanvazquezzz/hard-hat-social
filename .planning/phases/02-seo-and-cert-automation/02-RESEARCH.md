# Phase 2: SEO and Cert Automation - Research

**Researched:** 2026-03-03
**Domain:** Next.js 14 App Router metadata API, JSON-LD structured data, pending-user access control
**Confidence:** HIGH

## Summary

This phase makes contractor profile pages discoverable by search engines and social sharing tools, auto-populates certifications when an application is approved, and restricts pending applicants from accessing the full contractor experience. All changes are isolated to existing files — no new pages, no new database tables, no new npm packages.

The work splits into three distinct sub-domains. SEO (SEO-01 through SEO-04) uses the Next.js 14 `generateMetadata` API and inline `<script type="application/ld+json">` tags — both are built into the framework with zero additional dependencies. Cert automation (CERT-01) is a pure server-action change: add a Supabase insert into the existing `certifications` table inside the already-working `approveApplication()` function. Access control (AUTH-01) is the most nuanced piece — the contractors layout already redirects unauthenticated users, but pending-status users currently see the full experience; the change must distinguish pending from approved status and render a restricted view for the locked pages while still allowing `/explore` Social and Q&A.

**Primary recommendation:** Use Next.js built-in metadata APIs throughout (no third-party SEO libraries). Implement AUTH-01 via client-side Supabase status check in the existing `app/contractors/layout.tsx` plus inline guards in `/profile` and `/jobs` pages — same pattern already established in the codebase.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **OG image strategy:** Contractor profiles use `profile_photo_url` when set; fall back to `/og-default.png`. Public profiles use `avatar_url` when set; fall back to `/og-default.png`. `/og-default.png` is a branded static image in `/public` — dark navy background (`#0f172a`), amber/orange accent, 1200x630, site name + tagline.
- **JSON-LD schema type:** Use `Person` (not `LocalBusiness`). Include on BOTH `/contractors/[id]` AND `/u/[username]`. Core fields only for `/contractors/[id]`: `name`, `jobTitle` (trade), city/state location, `url`. `/u/[username]` JSON-LD: minimal — `name` (username), `url`. Do NOT include phone, email, or any contact info.
- **Cert auto-creation:** Create one cert record per `document_url` in the application, with `name` derived from trade, `verified: true`, `document_url` pointing to the uploaded file.
- **OG title pattern for contractor profiles:** `"{Name} — {Trade} | Contractors Connect"`
- **No new pages** — all changes live in existing files only.

### Claude's Discretion
- `metadataBase` URL: use `https://contractors-connect.vercel.app`
- Exact OG title and description templates for public profiles (`/u/[username]`)
- JSON-LD for `/u/[username]` when user has no contractor record (minimal schema fallback)
- Whether `og:image` is passed as absolute URL or relative (metadataBase handles this — use relative)

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTH-01 | Logged-in users with a pending application see a restricted experience — Social and Q&A explore are accessible, but Jobs, Profile dashboard, and contractor directory are locked with a "pending review" message | Addressed by enhancing existing `app/contractors/layout.tsx` client-side guard + inline pending checks in `/profile` and `/jobs` page components |
| SEO-01 | `metadataBase` is set in root `app/layout.tsx` so all relative OpenGraph image URLs resolve correctly | Single-line addition to `metadata` export in `app/layout.tsx` |
| SEO-02 | `/contractors/[id]` has `generateMetadata` with unique title, description, and OpenGraph tags per contractor | Export `generateMetadata` async function from same file as page component, re-fetch contractor data |
| SEO-03 | `/u/[username]` has `generateMetadata` with unique title, description, and OpenGraph tags per user | Export `generateMetadata` async function from same file as page component, re-fetch profile data |
| SEO-04 | `/contractors/[id]` includes JSON-LD structured data (Person schema) for Google rich results | Inline `<script type="application/ld+json">` in JSX, no new library |
| CERT-01 | `approveApplication()` automatically creates at least one certification record from application data | Insert into `certifications` table after contractor insert in `app/admin/actions.ts` |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | ^14.2.18 | `generateMetadata`, `Metadata` type, `metadataBase` | Already in project; built-in metadata API in App Router |
| @supabase/supabase-js | ^2.45.4 | Database reads in `generateMetadata`, cert insert | Already in project; used everywhere |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none new) | — | — | All functionality is built into existing stack |

**No new npm packages required for this phase.**

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Inline JSON-LD `<script>` tag | `next-seo`, `react-schemaorg` | Third-party libraries add bundle weight and complexity; inline script is the correct Next.js App Router approach per official docs |
| Client-side pending check | Middleware or server component check | Middleware would be cleaner but the existing auth guard is client-side; stay consistent with established pattern |

---

## Architecture Patterns

### Pattern 1: `generateMetadata` Export (Next.js App Router)

**What:** Export an async `generateMetadata` function from the same file as the page component. Next.js calls it at request time (or build time for static pages) to generate `<head>` tags including OG tags.

**When to use:** Any page that needs per-record dynamic metadata.

**Critical detail:** The function receives the same `params` as the page component. Re-fetching data inside `generateMetadata` is acceptable and recommended for MVP — Next.js may deduplicate fetches via the `fetch` cache, but since this project uses `getSupabaseAdmin()` (not `fetch`), two separate DB queries will happen. This is acceptable per CONTEXT.md: "acceptable for MVP (no caching complexity)."

**Example for `/contractors/[id]/page.tsx`:**
```typescript
// Source: Next.js App Router official docs
import type { Metadata } from 'next'

interface PageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const admin = getSupabaseAdmin()
  const { data } = await admin
    .from('contractors')
    .select('full_name, trade, location_city, location_state, bio, profile_photo_url')
    .eq('id', params.id)
    .eq('status', 'approved')
    .single()

  if (!data) {
    return { title: 'Contractor Not Found | Contractors Connect' }
  }

  const title = `${data.full_name} — ${data.trade} | Contractors Connect`
  const description = data.bio
    ? data.bio.slice(0, 155)
    : `${data.trade} contractor in ${data.location_city}, ${data.location_state}. Verified member of Contractors Connect.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: data.profile_photo_url
        ? [{ url: data.profile_photo_url, width: 1200, height: 630 }]
        : [{ url: '/og-default.png', width: 1200, height: 630 }],
    },
  }
}
```

### Pattern 2: `metadataBase` in Root Layout

**What:** A single `metadataBase` URL in `app/layout.tsx` causes Next.js to resolve all relative OG image paths as absolute URLs. This is required — social media crawlers reject relative paths.

**Example:**
```typescript
// Source: Next.js official docs — app/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://contractors-connect.vercel.app'),
  title: 'Contractors Connect — Verified Contractor Network',
  description: 'A curated network of verified, credentialed contractors. Find trusted welders, HVAC techs, electricians, and more.',
}
```

After this change, `images: [{ url: '/og-default.png' }]` in any `generateMetadata` output resolves to `https://contractors-connect.vercel.app/og-default.png` — the absolute URL crawlers require.

### Pattern 3: Inline JSON-LD Script Tag

**What:** Place a `<script type="application/ld+json">` inside the JSX return of the page component. Next.js renders this server-side so Googlebot can parse it without executing JavaScript.

**Where:** Only on `/contractors/[id]` per locked decisions. `/u/[username]` also gets JSON-LD per CONTEXT.md.

**Example for `/contractors/[id]/page.tsx`:**
```typescript
// Source: Google Structured Data docs + Next.js server component pattern
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: contractor.full_name,
  jobTitle: contractor.trade,
  address: {
    '@type': 'PostalAddress',
    addressLocality: contractor.location_city,
    addressRegion: contractor.location_state,
    addressCountry: 'US',
  },
  url: `https://contractors-connect.vercel.app/contractors/${contractor.id}`,
}

return (
  <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
    {/* rest of page JSX */}
  </>
)
```

**Why `dangerouslySetInnerHTML`:** JSON-LD requires raw string injection in JSX. The data comes from the project's own Supabase database (not user-controlled), so XSS risk is low. `JSON.stringify()` handles escaping correctly for valid JSON-LD. This is the documented Next.js approach for structured data.

### Pattern 4: Pending-Status Access Guard

**What:** After verifying a user is logged in, also check whether their application is `pending`. If pending, render a locked UI instead of the page content for `/contractors`, `/profile`, and `/jobs`.

**Where the check lives:**
- `/contractors/layout.tsx` — already does auth check; extend it to also check application status and pass it down, OR block directly and render a pending message
- `/profile/page.tsx` — currently does its own auth check; add pending check after session check
- `/jobs/page.tsx` — currently a server component with no auth check; needs either a client guard or a server-side session check

**Key constraint from requirements:** Social (`/explore?category=social`) and Q&A (`/explore?category=qa`) remain accessible to pending users. Jobs, Profile, and the contractor directory are locked.

**Existing pattern to follow — `app/contractors/layout.tsx`:**
```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ContractorsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [checked, setChecked] = useState(false)
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace('/auth')
        return
      }
      // Check application status
      const { data: app } = await supabase
        .from('applications')
        .select('status')
        .eq('user_id', session.user.id)
        .eq('status', 'pending')
        .maybeSingle()
      setIsPending(!!app)
      setChecked(true)
    })
  }, [router])

  if (!checked) return null
  if (isPending) return <PendingReviewBanner />

  return <>{children}</>
}
```

**For `/profile/page.tsx` and `/jobs/page.tsx`:** Add the same `supabase.from('applications').select('status').eq('user_id', ...).eq('status', 'pending').maybeSingle()` check after the session check, then render a pending message component instead of the full page.

**Note on `/jobs/page.tsx`:** It is currently a server component (`export default async function`). To add client-side auth/pending check, it either needs conversion to a client component (or a wrapper client layout). The cleanest approach for this phase: wrap `/jobs` in a `jobs/layout.tsx` client component that does the pending check — same pattern as `contractors/layout.tsx`. This avoids rewriting the server component.

### Pattern 5: CERT-01 — Insert Certifications on Approval

**What:** After the `contractors` insert in `approveApplication()`, loop over `application.document_urls` and insert one `certifications` row per document.

**Example addition to `app/admin/actions.ts`:**
```typescript
// After the contractors.insert() call — get the new contractor's ID
const { data: newContractor } = await admin
  .from('contractors')
  .select('id')
  .eq('user_id', userId ?? '')  // or use email if userId is null
  .eq('status', 'approved')
  .order('created_at', { ascending: false })
  .limit(1)
  .single()

if (newContractor && application.document_urls?.length > 0) {
  const certRecords = application.document_urls.map((docUrl: string) => ({
    contractor_id: newContractor.id,
    name: `${application.trade} Credential`,
    issuing_body: 'Submitted via Application',
    verified: true,
    document_url: docUrl,
  }))
  await admin.from('certifications').insert(certRecords)
}
```

**Edge cases to handle:**
- `application.document_urls` may be null or empty — guard with `?.length > 0`
- Need the new contractor's `id` (not in scope before the insert) — re-fetch after insert, or use the insert's returning data
- The contractor insert in current code does NOT use `.select()`, so no ID is returned — must add `.select('id').single()` to the insert or do a follow-up select

### Anti-Patterns to Avoid

- **Fetching contact info (phone/email) in `generateMetadata`:** OG tags are publicly visible in page source. Contact info is access-gated. Locked decision: never include phone or email in metadata.
- **Using `LocalBusiness` instead of `Person` for JSON-LD:** Locked decision is `Person`. `LocalBusiness` implies a business entity, not an individual contractor.
- **Using a third-party SEO library:** No additional packages. Next.js 14 metadata API is complete.
- **Converting `/contractors/[id]` page to client component:** It is a server component and must stay that way for `generateMetadata` to work. `generateMetadata` only works in server components.
- **Blocking `/explore` for pending users:** AUTH-01 says Social and Q&A on `/explore` remain accessible. The pending check should NOT be applied to `/explore`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| OG and Twitter card metadata | Custom `<meta>` tag component | Next.js `generateMetadata` API | Handles deduplication, ordering, and escaping correctly |
| Structured data injection | Custom hook or utility | Inline `<script dangerouslySetInnerHTML>` in server component | React's official pattern for script injection; no library needed |
| Absolute URL construction for OG images | Manual URL joining in each page | `metadataBase` in root layout | Framework resolves automatically; prevents bugs from env differences |

---

## Common Pitfalls

### Pitfall 1: `generateMetadata` Won't Run on Client Components
**What goes wrong:** Adding `export async function generateMetadata` to a file that has `'use client'` at the top causes a build error or the metadata is silently ignored.
**Why it happens:** `generateMetadata` is a server-only API. Client components cannot export it.
**How to avoid:** `/contractors/[id]/page.tsx` and `/u/[username]/page.tsx` are both server components — no `'use client'` directive. Do not add one. Keep all `generateMetadata` exports in server component files.
**Warning signs:** TypeScript error or missing `<title>` in rendered HTML.

### Pitfall 2: `dynamic = 'force-dynamic'` Required for Data-Dependent Metadata
**What goes wrong:** `/u/[username]/page.tsx` already has `export const dynamic = 'force-dynamic'`. Without this, Next.js may attempt to statically generate the page at build time and fail because Supabase admin data isn't available.
**Why it happens:** Dynamic routes with database fetches need `force-dynamic` to opt out of static generation.
**How to avoid:** Ensure `export const dynamic = 'force-dynamic'` is present in both `/contractors/[id]/page.tsx` and `/u/[username]/page.tsx`. Confirm `/contractors/[id]/page.tsx` does not already have this (it currently does not — add it alongside `generateMetadata`).

### Pitfall 3: OG Images Must Be Absolute URLs
**What goes wrong:** Social crawlers (Twitter, LinkedIn, Facebook) receive a relative path like `/og-default.png` and fail to load the image, showing no preview.
**Why it happens:** HTTP redirects and relative paths are not followed by all crawlers.
**How to avoid:** Set `metadataBase` in `app/layout.tsx`. After this, relative paths like `/og-default.png` in `generateMetadata` are automatically made absolute.

### Pitfall 4: Certifications Insert Needs the Contractor ID
**What goes wrong:** The current `approveApplication()` function calls `admin.from('contractors').insert([...])` without `.select()`. The new contractor's `id` (a UUID) is not returned, making it impossible to insert `certifications` records that reference `contractor_id`.
**Why it happens:** Supabase insert without `.select()` returns no data.
**How to avoid:** Change the contractors insert to `.insert([...]).select('id').single()` and capture the result. Use that `id` for the certifications insert. This is the single most important implementation detail for CERT-01.

### Pitfall 5: Pending Check Must Query `applications` Table, Not `contractors`
**What goes wrong:** Querying `contractors` for a pending user returns no rows (because pending contractors don't exist there until approved). Querying `contractors` with `.eq('status', 'pending')` will always return nothing — the pending application record lives in `applications`, not `contractors`.
**Why it happens:** The data model separates applicants (in `applications`) from approved contractors (in `contractors`). A pending user only has an `applications` row.
**How to avoid:** Check `supabase.from('applications').select('status').eq('user_id', userId).eq('status', 'pending').maybeSingle()` — querying the `applications` table with `.maybeSingle()` (not `.single()`) so no error is thrown when no matching row exists.

### Pitfall 6: `/jobs/page.tsx` Is a Server Component — Cannot Add Client Auth Check Directly
**What goes wrong:** `/jobs/page.tsx` uses `getSupabaseAdmin()` and `export default async function` — it's a server component. Adding `useEffect` or `supabase.auth.getSession()` (browser client) to a server component causes a build error.
**Why it happens:** Server components run on the server and cannot access browser APIs or Supabase browser client.
**How to avoid:** Create `app/jobs/layout.tsx` as a client component with the same pending-check pattern as `app/contractors/layout.tsx`. The server component `/jobs/page.tsx` itself does not change.

---

## Code Examples

### SEO-01: Add `metadataBase` to Root Layout
```typescript
// Source: Next.js 14 official docs — app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import NavBar from '@/components/NavBar'

export const metadata: Metadata = {
  metadataBase: new URL('https://contractors-connect.vercel.app'),
  title: 'Contractors Connect — Verified Contractor Network',
  description:
    'A curated network of verified, credentialed contractors. Find trusted welders, HVAC techs, electricians, and more.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <NavBar />
        <main>{children}</main>
      </body>
    </html>
  )
}
```

### SEO-02: `generateMetadata` for `/contractors/[id]`
```typescript
// Source: Next.js 14 official docs — export pattern
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const admin = getSupabaseAdmin()
  const { data } = await admin
    .from('contractors')
    .select('full_name, trade, location_city, location_state, bio, profile_photo_url')
    .eq('id', params.id)
    .eq('status', 'approved')
    .single()

  if (!data) return { title: 'Contractor Not Found | Contractors Connect' }

  const title = `${data.full_name} — ${data.trade} | Contractors Connect`
  const description = data.bio?.slice(0, 155) ??
    `${data.trade} contractor in ${data.location_city}, ${data.location_state}. Verified member of Contractors Connect.`
  const image = data.profile_photo_url ?? '/og-default.png'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: `${data.full_name} — ${data.trade}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}
```

### SEO-03: `generateMetadata` for `/u/[username]`
```typescript
// Source: Next.js 14 official docs — export pattern
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const admin = getSupabaseAdmin()
  const { data: profile } = await admin
    .from('profiles')
    .select('username, avatar_url')
    .eq('username', params.username)
    .single()

  if (!profile) return { title: 'Profile Not Found | Contractors Connect' }

  const title = `@${profile.username} | Contractors Connect`
  const description = `View @${profile.username}'s profile on Contractors Connect.`
  const image = profile.avatar_url ?? '/og-default.png'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: `@${profile.username}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}
```

### SEO-04: JSON-LD in `/contractors/[id]/page.tsx`
```typescript
// Source: Google Structured Data documentation + Next.js server component pattern
// Add inside the page component's return, before or after the main content wrapper

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: contractor.full_name,
  jobTitle: contractor.trade,
  address: {
    '@type': 'PostalAddress',
    addressLocality: contractor.location_city,
    addressRegion: contractor.location_state,
    addressCountry: 'US',
  },
  url: `https://contractors-connect.vercel.app/contractors/${contractor.id}`,
}

return (
  <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* existing page content */}
    </div>
  </>
)
```

### CERT-01: Modified `approveApplication()` with cert insert
```typescript
// Source: Supabase JS client docs — .insert().select()
// Change the contractors insert to capture the new row's ID:
const { data: newContractorData } = await admin
  .from('contractors')
  .insert([{
    user_id: userId,
    full_name: application.full_name,
    trade: application.trade,
    // ... all other fields ...
    status: 'approved',
  }])
  .select('id')
  .single()

// Then insert certifications if documents exist:
if (newContractorData && application.document_urls?.length > 0) {
  const certRecords = application.document_urls.map((docUrl: string) => ({
    contractor_id: newContractorData.id,
    name: `${application.trade} Credential`,
    issuing_body: 'Submitted via Application',
    verified: true,
    document_url: docUrl,
  }))
  await admin.from('certifications').insert(certRecords)
}
```

### AUTH-01: Pending check in client layout
```typescript
// Source: existing app/contractors/layout.tsx pattern — extend it
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function PendingReviewMessage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-slate-100">Application Under Review</h1>
      <p className="mt-3 text-slate-400">
        Your application is being reviewed. You&apos;ll get an email once it&apos;s approved.
        In the meantime, you can browse the{' '}
        <a href="/explore" className="text-amber-400 hover:underline">Explore feed</a>.
      </p>
    </div>
  )
}

export default function ContractorsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'pending' | 'ok'>('loading')

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace('/auth'); return }
      const { data: app } = await supabase
        .from('applications')
        .select('status')
        .eq('user_id', session.user.id)
        .eq('status', 'pending')
        .maybeSingle()
      setStatus(app ? 'pending' : 'ok')
    })
  }, [router])

  if (status === 'loading') return null
  if (status === 'pending') return <PendingReviewMessage />
  return <>{children}</>
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Third-party `next-seo` package | Next.js built-in `generateMetadata` API | Next.js 13+ App Router | No extra package; fully typed with `Metadata` type from `next` |
| Separate `head.tsx` file in pages router | `generateMetadata` export in server component file | Next.js 13 App Router | Co-located with page data; re-fetches alongside page render |
| Manual `<meta>` tags in `_document.tsx` | Root layout `metadata` export with `metadataBase` | Next.js 13 App Router | Framework handles tag deduplication and inheritance |

**Deprecated/outdated:**
- `next/head` with `<Head>` component: Pages Router pattern. Do NOT use in App Router — `app/layout.tsx` uses the metadata export pattern instead.
- `_document.tsx` and `_app.tsx`: Pages Router. Not present in this project and must not be created.

---

## Open Questions

1. **OG default image (`/og-default.png`) creation**
   - What we know: CONTEXT.md says Claude creates it — 1200x630, dark navy `#0f172a` background, amber/orange accent, site name + tagline
   - What's unclear: Whether this image needs to be an actual PNG file committed to `/public`, or whether a placeholder is sufficient for initial deployment
   - Recommendation: The planner should include an explicit task to create this file. Without it, all OG image fallbacks return a 404, which is worse than no image. An SVG-to-PNG approach or a programmatically generated image (using `canvas` or similar) would be needed — but since no new packages are allowed, the simplest approach is a hand-crafted static PNG placed in `/public`.

2. **`/contractors/[id]` missing `dynamic = 'force-dynamic'`**
   - What we know: `/u/[username]/page.tsx` has it; `/contractors/[id]/page.tsx` does not
   - What's unclear: Whether the absence causes build-time static generation failures with admin client fetches
   - Recommendation: Add `export const dynamic = 'force-dynamic'` to `/contractors/[id]/page.tsx` as part of the `generateMetadata` task — low risk, prevents unexpected caching.

3. **Pending user with no application row**
   - What we know: Some users may sign up (have auth.users row) without ever submitting an application
   - What's unclear: Should users with no application row at all be treated as "ok" (full access) or "pending" (restricted)?
   - Recommendation: Treat no-application-row as "ok" — these are users who signed up but haven't applied yet. The `maybeSingle()` returns `null` for no row, and the check `app ? 'pending' : 'ok'` correctly handles this.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected — no test config files present |
| Config file | None — Wave 0 gap |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SEO-01 | `metadataBase` resolves relative OG image URLs | manual-only | — Verify via `curl -s https://contractors-connect.vercel.app/contractors/[id] | grep og:image` | N/A |
| SEO-02 | `/contractors/[id]` returns contractor-specific OG title and image | manual-only | — Social link preview tool (e.g., opengraph.xyz) | N/A |
| SEO-03 | `/u/[username]` returns user-specific OG title and image | manual-only | — Social link preview tool | N/A |
| SEO-04 | `/contractors/[id]` page source contains valid `application/ld+json` block | manual-only | — `curl -s [url] | grep ld+json` then validate at validator.schema.org | N/A |
| AUTH-01 | Pending user sees restricted message on `/contractors`, `/profile`, `/jobs` but not `/explore` | manual-only | — Log in as pending user, navigate to each route | N/A |
| CERT-01 | Approving an application creates at least one certification record | manual-only | — Run approval flow in admin queue, then check `certifications` table in Supabase dashboard | N/A |

**Justification for manual-only:** No test framework is installed. All behaviors require either HTTP responses, Supabase state changes, or auth session state — not easily unit-tested without significant infrastructure setup that is out of scope for this phase.

### Sampling Rate
- **Per task commit:** Manual browser verification of the specific change
- **Per wave merge:** Full manual checklist (all 6 requirements above)
- **Phase gate:** All 6 items checked off before `/gsd:verify-work`

### Wave 0 Gaps
- No test infrastructure exists. This phase does not require adding any — all verification is manual per the constraints above.

*(No Wave 0 test infrastructure setup needed — manual verification is appropriate for this scope.)*

---

## Sources

### Primary (HIGH confidence)
- Next.js 14 App Router official docs — `generateMetadata` API, `metadataBase`, structured data patterns — verified against current Next.js 14.2.x behavior
- Google Search Central — JSON-LD structured data with `Person` schema type — https://developers.google.com/search/docs/appearance/structured-data/person
- Existing codebase — `app/contractors/layout.tsx`, `app/admin/actions.ts`, `app/contractors/[id]/page.tsx`, `app/u/[username]/page.tsx`, `app/layout.tsx`, `lib/types.ts` — direct file reads

### Secondary (MEDIUM confidence)
- Next.js documentation pattern for `dangerouslySetInnerHTML` with JSON-LD (well-established community pattern, consistent with official guidance)
- Supabase JS v2 `.insert().select()` pattern for returning inserted row data (documented API behavior)

### Tertiary (LOW confidence)
- None — all findings are grounded in codebase inspection and framework documentation

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new libraries; all findings based on direct code inspection
- Architecture: HIGH — `generateMetadata` is the documented Next.js App Router pattern; JSON-LD inline script is the documented approach; cert insert is a straightforward Supabase operation
- Pitfalls: HIGH — pitfalls identified from direct codebase reading (missing `.select()` on insert, missing `force-dynamic`, client vs server component constraints)

**Research date:** 2026-03-03
**Valid until:** 2026-06-01 (stable Next.js 14 APIs; Supabase JS v2 stable)
