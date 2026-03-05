# Codebase Structure

**Analysis Date:** 2026-03-04

## Directory Layout

```
contractors-connect/
├── app/                           # Next.js App Router — all routes and pages
│   ├── layout.tsx                 # Root layout with NavBar, global styles
│   ├── page.tsx                   # Homepage / landing page
│   ├── contractors/
│   │   ├── layout.tsx             # Auth guard — redirects pending/unauth users
│   │   ├── page.tsx               # Directory listing with search/filter + jobs feed
│   │   ├── loading.tsx            # Loading skeleton while contractors fetch
│   │   └── [id]/page.tsx          # Individual contractor detail page with certs
│   ├── apply/
│   │   └── page.tsx               # Multi-step application form with doc uploads
│   ├── auth/
│   │   ├── page.tsx               # Sign in / Sign up toggle page
│   │   ├── reset/page.tsx         # Password reset request page
│   │   └── update-password/page.tsx # Password reset link handler
│   ├── profile/
│   │   └── page.tsx               # User dashboard (3 tabs: Profile, Posts, Settings)
│   ├── explore/
│   │   └── page.tsx               # Social feed with category tabs (Social, Q&A)
│   ├── jobs/
│   │   ├── layout.tsx             # Auth guard (optional, same as contractors)
│   │   └── page.tsx               # Jobs/subcontracting board (jobs category posts)
│   ├── admin/
│   │   ├── layout.tsx             # Admin email guard — only admins via NEXT_PUBLIC_ADMIN_EMAILS
│   │   ├── page.tsx               # Application review queue
│   │   ├── actions.ts             # Server actions: approveApplication, rejectApplication
│   │   └── contractors/           # Approved contractors management
│   │       ├── page.tsx           # List of approved contractors (admin view)
│   │       └── [id]/
│   │           ├── page.tsx       # Manage single contractor (admin)
│   │           ├── actions.ts     # Contractor-specific mutations
│   │           └── CertRow.tsx    # Certification row component (admin)
│   ├── u/
│   │   └── [username]/page.tsx    # Public user profile at /u/@handle
│   └── api/
│       └── contact/
│           └── [id]/route.ts      # Protected endpoint — returns phone/email to approved contractors
├── components/                    # Reusable React components
│   ├── NavBar.tsx                 # Top navigation — session-aware, auth dropdown
│   ├── ContractorCard.tsx         # Card component for contractor grid
│   ├── SearchFilters.tsx          # Sidebar: trade/state/text search filters
│   ├── ProfileHeader.tsx          # Contractor profile header (photo, name, trade, location)
│   ├── CertificationBadge.tsx     # Badge display for certifications (verified, expiry status)
│   ├── PostCard.tsx               # Social post card (content, author, category, image)
│   └── ContactSection.tsx         # Gated contact info reveal for authenticated contractors
├── lib/                           # Shared utilities and configuration
│   ├── types.ts                   # TypeScript interfaces (Contractor, Certification, Application, Profile, Post)
│   ├── supabase.ts                # Browser-safe Supabase client (RLS enforced)
│   ├── supabase-admin.ts          # Server-only admin client (RLS bypassed, service role)
│   └── email.ts                   # Resend email functions (sendApprovalEmail, sendRejectionEmail)
├── supabase/
│   └── migrations/                # Database migrations (001 through 006)
│       ├── 001_initial.sql        # contractors, certifications, applications, RLS
│       ├── 002_profiles_posts.sql # profiles, posts tables
│       ├── 003_posts_category.sql # category column on posts
│       ├── 004_applications_user_id.sql # user_id FK on applications
│       ├── 005_rls_improvements.sql    # RLS fixes, full-text search index
│       └── 006_application_documents.sql # document_urls on applications, storage bucket
├── public/                        # Static assets (images, icons)
├── .env.local                     # Local env vars (git-ignored, not committed)
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript configuration
├── tailwind.config.ts             # Tailwind CSS configuration
├── next.config.js                 # Next.js configuration
├── CLAUDE.md                      # Project Bible (requirements, design, decisions)
└── .gitignore                     # Git ignore rules
```

## Directory Purposes

**`app/`:**
- Purpose: All user-facing pages, routes, and API endpoints
- Contains: Page components (tsx), layouts, server actions (ts), API routes
- Key files: `page.tsx` files define routes, `layout.tsx` provides layout hierarchy + guards, `actions.ts` contains server mutations

**`components/`:**
- Purpose: Reusable UI components — not tied to specific routes
- Contains: Form inputs, cards, badges, lists, navigation
- Key files: Each file exports one component (no internal subdirectories)
- Pattern: Imported by multiple pages, kept single-responsibility

**`lib/`:**
- Purpose: Shared utilities, config, and abstractions
- Contains: Type definitions, database clients, helper functions
- Key files:
  - `types.ts` — the single source of truth for all TypeScript interfaces
  - `supabase.ts` — browser-safe client, import in client components only
  - `supabase-admin.ts` — server-only client (marked with 'server-only'), import in server actions + API routes only
  - `email.ts` — Resend integration (server-only)

**`supabase/migrations/`:**
- Purpose: Version-controlled database schema changes
- Contains: SQL migration files (numbered 001–006)
- Key files:
  - 001: Contractors, certifications, applications tables + RLS policies
  - 002: Profiles and posts tables
  - 003: Posts category column
  - 004: Applications user_id FK
  - 005: RLS improvements, full-text search
  - 006: Application document URLs, storage bucket

**`public/`:**
- Purpose: Static assets served by Next.js
- Contains: Images, favicons, OG images, etc.

## Key File Locations

**Entry Points:**

- `app/layout.tsx`: Root layout with NavBar — every page inherits this
- `app/page.tsx`: Public homepage (/ route) — server component, fetches stats
- `app/apply/page.tsx`: Application form (unauthenticated, public)
- `app/auth/page.tsx`: Sign in/sign up (unauthenticated, public)
- `app/contractors/page.tsx`: Directory listing (authenticated, server component)
- `app/admin/page.tsx`: Admin review queue (admin-only via layout guard)

**Configuration:**

- `.env.local`: Local environment vars (contains NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, NEXT_PUBLIC_ADMIN_EMAILS)
- `package.json`: Dependencies (next, @supabase/supabase-js, resend, tailwind, etc.)
- `tsconfig.json`: TypeScript config with path alias `@/*` → `./`
- `tailwind.config.ts`: Tailwind theme (colors, spacing, responsive breakpoints)

**Core Logic:**

- `app/admin/actions.ts`: Approval/rejection business logic (approveApplication, rejectApplication)
- `app/apply/page.tsx`: Form collection and submission logic
- `components/SearchFilters.tsx`: Directory filter logic (URL params → router.push)
- `app/api/contact/[id]/route.ts`: Contact info gating logic (checks approval status)

**Testing:**

- No test files committed (testing patterns not yet established in codebase)

## Naming Conventions

**Files:**

- Page routes: `page.tsx` (Next.js convention)
- Layouts: `layout.tsx` (Next.js convention)
- Server actions: `actions.ts` (co-located with routes that use them)
- Components: PascalCase, one per file (e.g., `ContractorCard.tsx`, `SearchFilters.tsx`)
- API routes: `route.ts` (Next.js convention)
- Types: `types.ts` (one shared file for all interfaces)

**Directories:**

- Routes: kebab-case (e.g., `/apply`, `/contractors`, `/admin/contractors`)
- Dynamic routes: [bracketed] (e.g., `[id]`, `[username]`)
- No nested component directories (flat structure in `components/`)

**Functions and Variables:**

- Component names: PascalCase (e.g., `ContractorCard`, `SearchFilters`)
- Function names: camelCase (e.g., `approveApplication`, `handleChange`)
- Constants: UPPER_CASE (e.g., `TRADES`, `MAX_DOCS`)
- React hooks: camelCase with `use` prefix (e.g., `useState`, `useRouter`)

**Types and Interfaces:**

- Interface names: PascalCase (e.g., `Contractor`, `Application`, `Profile`)
- Type unions: PascalCase (e.g., `ContractorStatus = 'pending' | 'approved' | 'rejected'`)

## Where to Add New Code

**New Feature:**

- **Primary code:** Create new page file in `app/[feature]/page.tsx` (if route-dependent) or new component in `components/[FeatureName].tsx` (if reusable)
- **Shared logic:** Add to `lib/` if it's data/util, or co-locate server actions in `app/[feature]/actions.ts`
- **Tests:** Create `app/[feature]/__tests__/` folder (when testing is added)

**New Component/Module:**

- **Simple UI component:** Add to `components/[ComponentName].tsx` with single export
- **Feature-specific component:** Can co-locate in `app/[feature]/[ChildComponent].tsx` if not reusable (see `app/admin/contractors/[id]/CertRow.tsx`)
- **Type definition:** Add interface to `lib/types.ts`

**Utilities:**

- **Shared helpers:** Add to `lib/[utility].ts` (e.g., `lib/email.ts` for Resend integration)
- **Server-only utilities:** Mark with `'use server'` at top or use `'server-only'` directive
- **Client utilities:** Import Supabase client from `lib/supabase.ts`

**Database:**

- **Schema changes:** Create new migration file in `supabase/migrations/007_[description].sql` (numbered sequentially)
- **RLS policies:** Define in migration file (don't apply ad-hoc)

## Special Directories

**`app/admin/`:**
- Purpose: Admin-only routes and functionality
- Generated: No (all code committed)
- Committed: Yes
- Access: Controlled by `app/admin/layout.tsx` checking `NEXT_PUBLIC_ADMIN_EMAILS` env var
- Contains: Review queue (`page.tsx`), contractor management (`contractors/`), server actions

**`app/api/`:**
- Purpose: HTTP API endpoints (separate from page routes)
- Generated: No
- Committed: Yes
- Pattern: Each route at `api/[resource]/[id]/route.ts` exports GET/POST/PUT/DELETE handlers
- Example: `api/contact/[id]/route.ts` returns contact info (phone/email) with auth validation

**`app/auth/`:**
- Purpose: Authentication and account recovery flows
- Generated: No
- Committed: Yes
- Contains: Sign in/sign up (`page.tsx`), password reset (`reset/page.tsx`, `update-password/page.tsx`)

**`supabase/migrations/`:**
- Purpose: Database schema version control
- Generated: No (manually created and tested)
- Committed: Yes (migrations are source-controlled)
- Pattern: Each file numbered 001–006 (sequential), containing SQL DDL and RLS policy definitions
- Execution: Applied to Supabase project via `supabase db push` or dashboard

**`.env.local`:**
- Purpose: Local development environment variables
- Generated: Yes (created manually, not committed)
- Committed: No (in `.gitignore`)
- Contents: Supabase URL/keys, Resend API key, admin email list

**`public/`:**
- Purpose: Static assets
- Generated: Some (e.g., OG images may be generated)
- Committed: Yes
- Usage: Referenced as `/[filename]` in HTML/CSS (e.g., `<img src="/og-default.png" />`)

## Key Patterns

**Server Component for Data Fetching:**

```typescript
// app/contractors/page.tsx
export const dynamic = 'force-dynamic'

export default async function ContractorsPage({ searchParams }: PageProps) {
  const admin = getSupabaseAdmin()
  const { data, error } = await admin
    .from('contractors')
    .select('*')
    .eq('status', 'approved')

  return <ContractorGrid contractors={data ?? []} />
}
```

**Client Component for Interactivity:**

```typescript
// components/SearchFilters.tsx
'use client'

import { useRouter } from 'next/navigation'

export default function SearchFilters({ currentTrade }: Props) {
  const router = useRouter()

  function updateFilter(trade: string) {
    router.push(`/contractors?trade=${trade}`)
  }

  return <button onClick={() => updateFilter('Welding')}>Welding</button>
}
```

**Server Action for Mutations:**

```typescript
// app/admin/actions.ts
'use server'

import { revalidatePath } from 'next/cache'

export async function approveApplication(appId: string) {
  const admin = getSupabaseAdmin()
  // ... approve logic
  revalidatePath('/admin')
}
```

**API Route for Protected Endpoints:**

```typescript
// app/api/contact/[id]/route.ts
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  // Verify auth token
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check if user is approved
  // Return contact info if authorized
}
```

---

*Structure analysis: 2026-03-04*
