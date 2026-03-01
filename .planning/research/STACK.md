# Stack Research

**Domain:** Verified contractor directory — Next.js 14 App Router, Supabase, Resend
**Researched:** 2026-03-01
**Confidence:** HIGH (all primary claims verified against official Next.js docs, Supabase docs, Resend docs)

---

## Context: What This Research Covers

The core stack (Next.js 14, Supabase, Tailwind, TypeScript, Resend, Vercel) is already chosen and locked. This research focuses on the specific APIs, patterns, and tooling needed for the active milestone:

1. **Next.js `generateMetadata` + OpenGraph** — correct API usage, params handling
2. **JSON-LD structured data** — official pattern, TypeScript types
3. **Supabase Storage bucket setup** — RLS policies for public read / authenticated write
4. **Resend domain verification** — DNS records required for deliverability
5. **Loading skeletons and Suspense** — Next.js App Router pattern

---

## Recommended Stack

### Core Technologies (Already in place — verify versions)

| Technology | Current Version | Purpose | Status |
|------------|----------------|---------|--------|
| Next.js | ^14.2.18 | App Router, SSR, metadata API, streaming | In use |
| Supabase JS | ^2.45.4 | Database, auth, storage | In use |
| Tailwind CSS | ^3.4.14 | Styling, skeleton animations | In use |
| TypeScript | ^5.6.3 | Type safety | In use |
| Resend | ^6.9.3 | Transactional email | In use |

All current versions are within range for the features described below. No upgrades are required.

---

### Feature 1: SEO Metadata (generateMetadata)

**Use the built-in `metadata` object and `generateMetadata` function — no library needed.**

Official Next.js docs (last updated 2026-02-27, version 16.1.6) confirm these are the canonical patterns.

#### Static metadata (layout.tsx or page.tsx)

Use for pages where content is fixed at build time: homepage, `/contractors`, `/apply`.

```typescript
// app/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contractors Connect — Verified Contractor Network',
  description: 'Find verified, credentialed contractors. Welders, HVAC, Electricians — verified before they join.',
  openGraph: {
    title: 'Contractors Connect — Verified Contractor Network',
    description: 'Find verified, credentialed contractors. Welders, HVAC, Electricians — verified before they join.',
    url: 'https://contractorsconnect.com',
    siteName: 'Contractors Connect',
    images: [
      {
        url: '/og-image.png',  // relative path works with metadataBase
        width: 1200,
        height: 630,
        alt: 'Contractors Connect — Verified Contractor Directory',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contractors Connect — Verified Contractor Network',
    description: 'Find verified, credentialed contractors.',
    images: ['/og-image.png'],
  },
}
```

#### metadataBase (required in root layout)

Set once in `app/layout.tsx`. Without it, relative paths in OG images cause a build error.

```typescript
// app/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://contractorsconnect.com'),
  title: {
    template: '%s | Contractors Connect',
    default: 'Contractors Connect — Verified Contractor Network',
  },
  description: 'A curated network of verified, credentialed contractors.',
}
```

#### Title template pattern

The `title.template` in the root layout (`'%s | Contractors Connect'`) means child pages only need:

```typescript
// app/contractors/page.tsx
export const metadata: Metadata = {
  title: 'Find Contractors',  // renders as "Find Contractors | Contractors Connect"
}
```

#### Dynamic metadata (generateMetadata)

Use for pages where content comes from the database: `/contractors/[id]`, `/u/[username]`.

```typescript
// app/contractors/[id]/page.tsx
import type { Metadata, ResolvingMetadata } from 'next'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params
  const admin = getSupabaseAdmin()
  const { data: contractor } = await admin
    .from('contractors')
    .select('full_name, trade, location_city, location_state, bio, profile_photo_url')
    .eq('id', id)
    .eq('status', 'approved')
    .single()

  if (!contractor) return {}

  const title = `${contractor.full_name} — Verified ${contractor.trade} Contractor`
  const description = contractor.bio
    ? contractor.bio.slice(0, 155)
    : `Verified ${contractor.trade} contractor in ${contractor.location_city}, ${contractor.location_state}.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      images: contractor.profile_photo_url
        ? [{ url: contractor.profile_photo_url, width: 400, height: 400 }]
        : [],
    },
  }
}
```

**Key constraint:** `generateMetadata` must be in a Server Component. Cannot coexist with `'use client'` in the same file. Cannot export both `metadata` object and `generateMetadata` from the same segment.

**Performance note:** `fetch` calls inside `generateMetadata` are automatically memoized — Supabase admin queries are not `fetch`-based, so React `cache()` should be used if the same query runs in both `generateMetadata` and the page component. (MEDIUM confidence — this is the documented behavior for `fetch`; Supabase JS uses its own request layer.)

---

### Feature 2: JSON-LD Structured Data

**Use the official Next.js pattern — inline `<script>` tag with XSS sanitization. Add `schema-dts` for TypeScript types.**

Official Next.js docs (2026-02-27) recommend exactly this pattern. No external rendering library needed.

#### The pattern

```typescript
// app/contractors/[id]/page.tsx
import { WithContext, LocalBusiness } from 'schema-dts'

export default async function ContractorProfilePage({ params }) {
  const { id } = await params
  // ... fetch contractor data ...

  const jsonLd: WithContext<LocalBusiness> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: contractor.full_name,
    description: contractor.bio ?? undefined,
    address: {
      '@type': 'PostalAddress',
      addressLocality: contractor.location_city,
      addressRegion: contractor.location_state,
      addressCountry: 'US',
    },
    url: `${process.env.NEXT_PUBLIC_APP_URL}/contractors/${contractor.id}`,
    image: contractor.profile_photo_url ?? undefined,
  }

  return (
    <section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      {/* rest of page */}
    </section>
  )
}
```

**XSS note:** The `.replace(/</g, '\\u003c')` is required — official Next.js docs flag this as a security requirement to prevent injection. Do not skip it.

**Schema type for contractor profiles:** Use `LocalBusiness` (covers trade businesses). The `Person` type is also valid but `LocalBusiness` gives better Google rich result eligibility for service providers.

**Validation:** Test with [Google Rich Results Test](https://search.google.com/test/rich-results) after adding.

#### TypeScript types library

| Library | Version | Purpose | Confidence |
|---------|---------|---------|------------|
| `schema-dts` | 1.1.5 | TypeScript types for Schema.org JSON-LD — compile-time validation, zero runtime cost | MEDIUM |

**Note on schema-dts maintenance:** Latest release was v1.1.5 (March 2021). The library is type-only (zero runtime), so the lack of recent releases is low risk — Schema.org types are stable. Officially referenced in Next.js docs. Weekly downloads ~334K. Install as a dev dependency.

**Install:**
```bash
npm install -D schema-dts
```

**Do NOT use:** `react-schemaorg` or similar runtime rendering packages. The official pattern is a plain `<script>` tag — no runtime overhead.

---

### Feature 3: Supabase Storage Bucket Setup

**Buckets must be created manually in the Supabase dashboard or via SQL migration. RLS policies on `storage.objects` control access.**

Source: Official Supabase Storage docs.

#### Bucket access models

| Type | Behavior | When to Use |
|------|----------|-------------|
| Public | Anyone with URL can read. Upload/delete still requires RLS policy. | `avatars`, `post-images` — profile photos should be publicly viewable |
| Private | All operations require RLS policy or service role key. | `application-docs` — credential documents should NOT be publicly accessible |

#### Required RLS policies (SQL migration)

The `application-docs` bucket is already created in migration 006. The `avatars` and `post-images` buckets may still need policies. Add to a new migration file:

```sql
-- Ensure buckets exist (idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('avatars', 'avatars', true),
  ('post-images', 'post-images', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Public read for avatars (redundant when bucket is public, but explicit is better)
CREATE POLICY "Public read on avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Authenticated users can upload their own avatar
CREATE POLICY "Authenticated upload to avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

-- Authenticated users can update (replace) their own avatar
CREATE POLICY "Authenticated update avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars');

-- Public read for post images
CREATE POLICY "Public read on post-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-images');

-- Authenticated users can upload post images
CREATE POLICY "Authenticated upload to post-images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'post-images');

-- application-docs: NO public read policy (private bucket)
-- Only service role (supabase-admin.ts) can read application docs
-- Authenticated users can upload their own application docs
CREATE POLICY "Authenticated upload to application-docs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'application-docs');
```

**Key pitfall:** A public bucket still requires an INSERT policy for uploads. "Public" only affects reads. Without an INSERT policy, `supabase.storage.from('avatars').upload()` returns 403 even for authenticated users.

**Upsert note:** Overwriting a file (upsert) requires both INSERT and UPDATE policies, not just INSERT.

**Verification:** Confirm `application-docs` bucket exists before running migration. Migration 006 may have created it via SQL — verify in Supabase dashboard before adding duplicate INSERT.

---

### Feature 4: Resend Domain Verification

**Add SPF, DKIM, and DMARC DNS records at your domain registrar. Resend provides the exact values in its dashboard.**

Source: Resend official docs, dmarc.wiki/resend (MEDIUM confidence for exact record values — Resend generates unique DKIM keys per domain, so only the dashboard provides the actual values).

#### Required DNS records

| Record | Type | Name/Host | Value | Required? |
|--------|------|-----------|-------|-----------|
| SPF | TXT | `send` (subdomain of your domain) | `v=spf1 include:_spf.resend.com ~all` | Yes |
| DKIM | TXT | `resend._domainkey.yourdomain.com` | Provided by Resend dashboard (unique per domain) | Yes |
| MX | MX | `send` (subdomain) | `feedback-smtp.us-east-1.amazonses.com` (priority 10) | Yes (for bounce processing) |
| DMARC | TXT | `_dmarc.yourdomain.com` | `v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com` | Strongly recommended |

**Critical note:** The DKIM public key value is unique to your domain and generated by Resend. You cannot hardcode it — log into `resend.com/domains`, add your domain, and copy the exact values Resend provides. The records above are structural examples only.

#### Verification process

1. Log into Resend dashboard → Domains → Add Domain
2. Enter your sending domain (e.g., `contractorsconnect.com`)
3. Resend shows the exact TXT/MX records to add
4. Add records at your DNS provider (Cloudflare, Route 53, Namecheap, etc.)
5. Resend polls for verification — typically 5-30 minutes; up to 72 hours before `failed` status
6. Domain shows `verified` status → emails send from your domain, not Resend's shared domain

**Why this matters for deliverability:** Emails sent from Resend's shared domain (`send.resend.dev`) will reach inboxes but may score lower on spam filters than emails from a verified custom domain. For approval/rejection emails to tradespeople, custom domain verification is worth doing before onboarding the founding cohort.

**DMARC policy recommendation:** Start with `p=none` (monitor mode) during initial setup to avoid accidentally blocking legitimate emails:
```
v=DMARC1; p=none; rua=mailto:dmarc@contractorsconnect.com
```
Escalate to `p=quarantine` after confirming legitimate emails pass. DMARC adoption grew 75% among top domains between 2023-2025 (MEDIUM confidence, WebSearch).

---

### Feature 5: Loading Skeletons

**Use Next.js `loading.js` convention for route-level skeletons and Tailwind `animate-pulse` for skeleton UI. No library needed.**

Source: Official Next.js docs on `loading.js` file convention.

#### Route-level skeleton (loading.js)

Create a `loading.tsx` file in the same directory as a `page.tsx`. Next.js automatically wraps it in a Suspense boundary.

```typescript
// app/contractors/loading.tsx
export default function ContractorsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-lg border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-slate-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-slate-700" />
                <div className="h-3 w-1/2 rounded bg-slate-700" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-3 rounded bg-slate-700" />
              <div className="h-3 w-5/6 rounded bg-slate-700" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

#### Component-level Suspense

For finer-grained streaming (e.g., loading the directory grid while filters render immediately):

```typescript
// app/contractors/page.tsx
import { Suspense } from 'react'
import ContractorGrid from './ContractorGrid'
import ContractorGridSkeleton from './ContractorGridSkeleton'

export default function ContractorsPage() {
  return (
    <div>
      <SearchFilters />  {/* renders immediately, no data fetching */}
      <Suspense fallback={<ContractorGridSkeleton />}>
        <ContractorGrid />  {/* server component that fetches data */}
      </Suspense>
    </div>
  )
}
```

**Tailwind utility:** `animate-pulse` creates the breathing skeleton effect. Use `bg-slate-700` on the placeholder shapes to match the existing dark theme (`bg-slate-900` background, `border-slate-800` borders).

---

## Supporting Libraries

| Library | Version | Install as | Purpose | Decision |
|---------|---------|-----------|---------|----------|
| `schema-dts` | 1.1.5 | devDependency | TypeScript types for JSON-LD Schema.org | ADD — type safety only, zero runtime |

No other new dependencies are needed for this milestone. All other features use built-in Next.js APIs, Tailwind utilities, or existing packages.

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| JSON-LD rendering | Plain `<script>` tag (official Next.js pattern) | `react-schemaorg`, `next-seo` | `next-seo` doesn't support App Router metadata API; `react-schemaorg` adds runtime overhead; official pattern is simpler |
| Metadata | Built-in `generateMetadata` | `next-seo` | `next-seo` predates the App Router metadata API; redundant in Next.js 13+ |
| Skeletons | Tailwind `animate-pulse` + `loading.js` | `react-loading-skeleton` library | No library needed; Tailwind achieves same result with less bundle overhead |
| Email auth records | Resend-provided values | Manual SPF configuration | Resend manages SPF/DKIM automatically once domain is added in dashboard; manual setup is error-prone |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `next-seo` | Built for Pages Router, not App Router. Actively misleads with `NextSeo` component that conflicts with `generateMetadata` | Built-in `metadata` object and `generateMetadata` |
| `react-schemaorg` | Adds runtime overhead; renders JSON-LD via React components unnecessarily | Plain `<script>` tag with `dangerouslySetInnerHTML` per official docs |
| `react-loading-skeleton` | Adds bundle weight; Tailwind `animate-pulse` achieves identical visual result | Tailwind `animate-pulse` on `<div>` elements |
| Exporting both `metadata` and `generateMetadata` from the same file | Build error — Next.js does not allow this | Use one or the other per route segment |
| `'use client'` on pages with `generateMetadata` | Next.js metadata exports only work in Server Components | Keep metadata in Server Components; extract interactive parts to separate Client Components |
| `themeColor` in metadata object | Deprecated since Next.js 14 — use `generateViewport` instead | `export const viewport: Viewport = { themeColor: '...' }` |

---

## Stack Patterns by Variant

**For static pages (homepage, /apply, /auth):**
- Use `export const metadata: Metadata = { ... }` (static object)
- Place `metadataBase` in root `app/layout.tsx`
- No data fetching needed in metadata

**For dynamic profile pages (/contractors/[id], /u/[username]):**
- Use `export async function generateMetadata({ params })`
- Fetch contractor data with `getSupabaseAdmin()`
- Add JSON-LD `<script>` tag inside the page's return JSX
- Keep data fetching DRY: extract to a shared server function if both page and metadata need the same query

**For directory/list pages (/contractors, /explore, /jobs):**
- Use `loading.tsx` for route-level skeleton
- Static `metadata` export (page title doesn't depend on URL params)
- Consider `Suspense` at component level if search filters should render before results

**For Supabase Storage:**
- Public buckets (`avatars`, `post-images`): mark `public: true` + add INSERT policy
- Private buckets (`application-docs`): mark `public: false`, use service role key for admin reads

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|----------------|-------|
| `next@^14.2.18` | `schema-dts@1.1.5` | schema-dts is type-only, no runtime compatibility issues |
| `next@^14.2.18` | Built-in `metadata` API | `generateMetadata` introduced in Next.js 13.2.0; streaming metadata added in 15.2.0 (not available in 14.x) |
| `@supabase/supabase-js@^2.45.4` | Supabase Storage RLS policies | Policies are server-side SQL; client version is not relevant to policy behavior |

**Note on streaming metadata:** The `generateMetadata` streaming feature (where metadata streams after initial HTML) was added in Next.js 15.2.0. Running Next.js 14.x means metadata resolution blocks the initial response for dynamic routes. This is acceptable behavior for this project's scale and does not require upgrading Next.js.

---

## Installation

```bash
# Only new dependency needed for this milestone
npm install -D schema-dts
```

No other packages are needed. All other features use built-in Next.js APIs or existing dependencies.

---

## Sources

- [Next.js generateMetadata API Reference](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) — HIGH confidence. Official docs, updated 2026-02-27. All `generateMetadata`, `metadata` object, `openGraph`, `twitter`, `metadataBase`, and title template patterns verified here.
- [Next.js JSON-LD Guide](https://nextjs.org/docs/app/guides/json-ld) — HIGH confidence. Official docs, updated 2026-02-27. `<script>` tag pattern, XSS sanitization, and `schema-dts` reference verified here.
- [Next.js loading.js Convention](https://nextjs.org/docs/app/api-reference/file-conventions/loading) — HIGH confidence. Official docs. Route-level Suspense pattern confirmed.
- [Supabase Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control) — HIGH confidence. Official Supabase docs. RLS policy structure for INSERT and SELECT on `storage.objects` confirmed.
- [Supabase Storage Bucket Fundamentals](https://supabase.com/docs/guides/storage/buckets/fundamentals) — HIGH confidence. Public vs private bucket behavior confirmed.
- [Resend Domain Introduction](https://resend.com/docs/dashboard/domains/introduction) — HIGH confidence. SPF + DKIM requirement, verification status behavior confirmed.
- [schema-dts GitHub Releases](https://github.com/google/schema-dts/releases) — MEDIUM confidence. Latest version v1.1.5 (2021). Type-only library, stable despite infrequent releases.
- [Resend SPF/DKIM values via dmarc.wiki](https://dmarc.wiki/resend) — MEDIUM confidence. SPF record value `v=spf1 include:_spf.resend.com ~all` confirmed via multiple sources. DKIM values are dashboard-generated and cannot be documented externally.

---

*Stack research for: Contractors Connect — Next.js 14 App Router SEO, Storage, Email milestone*
*Researched: 2026-03-01*
