# Phase 2: SEO and Cert Automation - Context

**Gathered:** 2026-03-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Add OpenGraph metadata and JSON-LD structured data to existing profile pages so they're discoverable and shareable. Auto-create a certification record when an application is approved. No new pages — changes live in existing files only.

</domain>

<decisions>
## Implementation Decisions

### OG image strategy
- Contractor profiles (`/contractors/[id]`): use `profile_photo_url` when set; fall back to `/og-default.png`
- Public profiles (`/u/[username]`): use `avatar_url` when set; fall back to `/og-default.png`
- `/og-default.png` is a branded static image in `/public` — Claude creates it (1200x630, dark navy background, site name + tagline matching the app's design language)
- Phone and email are NOT included in OG tags (contact info is gated to approved members only)

### JSON-LD schema type
- Use `Person` schema type (not `LocalBusiness`) — contractors are individuals, not companies
- Include on BOTH `/contractors/[id]` AND `/u/[username]` pages
- Core fields only for `/contractors/[id]`: `name`, `jobTitle` (trade), city/state location, `url` (canonical page URL)
- `/u/[username]` JSON-LD: minimal — `name` (username), `url` (canonical page URL)
- Do NOT include phone, email, or contact info in JSON-LD (access-gated data)

### Cert auto-creation
- Not discussed — Claude's discretion
- CERT-01 requires `approveApplication()` to create at least one certification record
- Application has `document_urls[]` and `trade` field — use these as the source of truth
- Practical approach: create one cert record per document_url, with `name` derived from trade, `verified: true`, `document_url` pointing to the uploaded file

### Claude's Discretion
- `metadataBase` URL in root layout (use `https://contractors-connect.vercel.app`)
- Exact OG title and description templates for contractor profiles
- Exact OG title and description templates for public profiles
- JSON-LD for `/u/[username]` when user has no contractor record (minimal schema)
- Whether `og:image` gets passed as absolute URL or relative (metadataBase handles this)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/contractors/[id]/page.tsx`: async server component with full contractor data available — add `generateMetadata` export to same file
- `app/u/[username]/page.tsx`: async server component with profile + optional contractor data — add `generateMetadata` export to same file
- `app/admin/actions.ts`: `approveApplication()` already inserts into `contractors` and `profiles` tables — add `certifications` insert after contractors insert
- `app/layout.tsx`: has `metadata` export but no `metadataBase` — add it here

### Established Patterns
- Root layout uses standard Next.js `Metadata` type from `'next'`
- Profile pages fetch data via `getSupabaseAdmin()` at the top of the component
- `generateMetadata` will re-fetch the same data — acceptable for MVP (no caching complexity)

### Integration Points
- `metadataBase` in root layout makes all relative OG image paths (`/og-default.png`) resolve correctly across all pages
- CERT-01 change is isolated to `app/admin/actions.ts` — no database schema changes needed (certifications table already exists)

</code_context>

<specifics>
## Specific Ideas

- OG branded default image should match the app's dark navy (`#0f172a`) background with amber/orange accent — consistent with existing design
- Contractor profile OG title pattern: `"{Name} — {Trade} | Contractors Connect"`
- JSON-LD should only expose public, non-gated information

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-seo-and-cert-automation*
*Context gathered: 2026-03-01*
