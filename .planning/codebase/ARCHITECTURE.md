# Architecture

**Analysis Date:** 2026-03-04

## Pattern Overview

**Overall:** Next.js server-client architecture with role-based access control (RBAC) and Row Level Security (RLS).

**Key Characteristics:**
- Server Components for data fetching and authentication guards
- Client Components for interactive features and session state
- Two-tier Supabase client system: browser-safe client + server-only admin client with RLS bypass
- Server Actions for mutations (forms, approvals, rejections)
- Protected API routes for auth-gated contact disclosure
- Email notification system via Resend for workflow triggers

## Layers

**Presentation Layer:**
- Purpose: User-facing UI rendered via React components and Next.js pages
- Location: `app/`, `components/`
- Contains: Page layouts, client-side UI components, form handling, navigation
- Depends on: Supabase client, types, utility functions
- Used by: Browser / End users

**Page/Routing Layer:**
- Purpose: Next.js App Router orchestrates page rendering and auth guards
- Location: `app/layout.tsx`, `app/[path]/layout.tsx`, `app/[path]/page.tsx`
- Contains: Route definitions, auth guards (in layouts), metadata generation
- Depends on: Supabase client, server actions, external data sources
- Used by: Router and middleware

**Server Action / Mutation Layer:**
- Purpose: Handles form submissions and business logic mutations in a server-only context
- Location: `app/*/actions.ts`, `app/admin/actions.ts`
- Contains: `approveApplication()`, `rejectApplication()`, post creation, profile updates
- Depends on: Supabase admin client, email service, cache revalidation
- Used by: Forms and interactive components

**API Route Layer:**
- Purpose: HTTP endpoints for specific client-server communication needs
- Location: `app/api/`
- Contains: Protected contact info endpoint (`/api/contact/[id]`)
- Depends on: Supabase admin client, authentication verification
- Used by: Browser fetch calls (ContactSection component)

**Data Access Layer:**
- Purpose: Supabase client instances that enforce security policies
- Location: `lib/supabase.ts`, `lib/supabase-admin.ts`
- Contains: Browser-safe client (RLS enforced) and admin client (RLS bypassed)
- Depends on: Supabase API and Auth backend
- Used by: All components, pages, server actions, API routes

**Database & Auth:**
- Purpose: Supabase Postgres backend with Row Level Security policies
- Location: Remote Supabase project (migrations in `supabase/migrations/`)
- Contains: 5 tables (contractors, certifications, applications, profiles, posts), auth.users
- Depends on: None (data source of truth)
- Used by: All code that queries data

**External Service Integrations:**
- Purpose: Third-party services for non-core functionality
- Location: `lib/email.ts`, Resend API
- Contains: Email sending for approval/rejection workflows
- Depends on: Resend API + env var
- Used by: Server actions (approveApplication, rejectApplication)

**Type System:**
- Purpose: Shared TypeScript interfaces for type safety across layers
- Location: `lib/types.ts`
- Contains: Contractor, Certification, Application, Profile, Post interfaces
- Depends on: None (definitions only)
- Used by: All code

## Data Flow

**User Registration and Profile Creation:**

1. User navigates to `/auth` → `app/auth/page.tsx` (client component)
2. User submits email/password via `supabase.auth.signUp()`
3. Supabase Auth creates auth.users row and sends confirmation email
4. User confirms email, creates session
5. Session state updates in NavBar, gating visible
6. User sees "Apply" CTA on homepage

**Contractor Application Submission:**

1. User navigates to `/apply` → `app/apply/page.tsx` (client component)
2. User fills multi-step form: trade, location, certifications, document uploads
3. Documents uploaded to Supabase Storage bucket `application-docs` during form submission
4. On final submit: client calls `POST /api/... ` or server action creating applications row
5. Application row inserted with `status: 'pending'`, document_urls array populated
6. Application appears in `/admin` queue

**Admin Review and Contractor Approval:**

1. Admin at `app/admin/page.tsx` sees list of pending applications
2. Admin clicks "Approve" → form action calls server action `approveApplication(appId)`
3. `approveApplication()` (in `app/admin/actions.ts`):
   - Fetches application record
   - Inserts new contractor row with `status: 'approved'`
   - Auto-creates certification records from document_urls
   - Upserts profile row so user gets username (email prefix)
   - Updates application status to 'approved'
   - Sends approval email via Resend (non-blocking)
   - Revalidates `/admin` cache
4. Contractor receives approval email and signs in
5. Contractor profile becomes accessible to other contractors via `/contractors`

**Public Contractor Directory Access:**

1. Non-authenticated user lands on `/` or navigates to `/contractors`
2. `/contractors` page fetches approved contractors via `getSupabaseAdmin()` server-side
3. Page renders grid of ContractorCard components
4. Each card links to `/contractors/[id]` for detail view
5. Contact info (phone/email) is redacted on card
6. When authenticated contractor views `/contractors/[id]`:
   - ProfileHeader displays contractor info
   - ContactSection renders with "Show Contact" button
   - Button fetches via `/api/contact/[id]` with Bearer token
   - API validates token, checks requesting user is approved contractor
   - Returns phone/email if authorized, 403 if not

**Post/Social Feed:**

1. Approved contractor creates post in `/profile` → Posts tab
2. Client component submits post via server action or direct insert
3. Post row created in posts table with `category: 'social' | 'qa' | 'jobs'`
4. Optional image uploaded to Supabase Storage bucket `post-images`
5. `/explore?category=social` fetches posts by category
6. `/contractors` also displays job posts inline (`category: 'jobs'`)
7. Posts joined with profiles (username, avatar) and contractors (trade, location)

**State Management:**

- Session state: Managed by Supabase Auth client (getSession, onAuthStateChange)
- UI state: React useState in client components (NavBar, SearchFilters, forms)
- Cache: Next.js revalidatePath() after mutations to refresh server-rendered pages
- No global state management library (Redux, Zustand) — all state local or server-driven

## Key Abstractions

**Contractor:**
- Purpose: Represents a verified tradeesperson with credentials and contact info
- Examples: `lib/types.ts` (interface), `app/contractors/page.tsx` (listing), `app/contractors/[id]/page.tsx` (detail)
- Pattern: Fetched server-side, contact info gated by API endpoint that checks RLS

**Application:**
- Purpose: Pre-approval submission with full form data and documents
- Examples: `app/apply/page.tsx` (form), `app/admin/page.tsx` (queue), `app/admin/actions.ts` (approval handler)
- Pattern: Lives in applications table until approval → converted to contractors + certifications rows

**Certification:**
- Purpose: Proof of trade qualification (AWS, EPA, state license, insurance)
- Examples: `components/CertificationBadge.tsx` (display), `app/contractors/[id]/page.tsx` (profile detail), auto-created in `approveApplication()`
- Pattern: Document URL stored, verified flag set at admin approval time

**Profile:**
- Purpose: User metadata separate from auth (username, avatar)
- Examples: Created automatically at approval, editable in `/profile` tab
- Pattern: 1:1 with auth.users via FK, lazy-created when contractor approved

**Post:**
- Purpose: Community content: job posting, Q&A question, availability update
- Examples: Created in `/profile` Posts tab, displayed in `/explore`, `/contractors` job feed
- Pattern: Attached to contractor_id (optional) if author is verified, categorized by type

**ContactSection:**
- Purpose: Gated component that reveals contact info to authenticated contractors only
- Examples: `components/ContactSection.tsx` (UI), `/api/contact/[id]/route.ts` (auth backend)
- Pattern: Client-side "Show Contact" button fetches token, sends to API, API validates approval status

## Entry Points

**Public Landing Page:**
- Location: `app/page.tsx`
- Triggers: User navigates to `/` or is redirected from public route
- Responsibilities: Display hero, hero CTA, trade cards, how-it-works section, fetch stats (approved count, trades count, applications count)
- Server action: Fetches via admin client (stats are read-only)

**Application Form:**
- Location: `app/apply/page.tsx`
- Triggers: User clicks "Apply as Contractor" or navigates to `/apply`
- Responsibilities: Multi-step form (basic info, credentials, document uploads), client-side validation, submission to applications table
- Client-side: Handles form state, file uploads to Storage, success/error messaging

**Contractor Directory:**
- Location: `app/contractors/page.tsx`
- Triggers: Authenticated user clicks "Directory" or `/contractors` in nav
- Responsibilities: Search, filter by trade/state, text search, display grid of ContractorCards, also show job posts sidebar
- Auth guard: `app/contractors/layout.tsx` redirects unauthenticated to `/auth`, checks for pending application (shows message if pending)

**Contractor Detail Page:**
- Location: `app/contractors/[id]/page.tsx`
- Triggers: User clicks ContractorCard or navigates directly to `/contractors/:id`
- Responsibilities: Display full contractor profile, certifications list, bio, location, years experience, contact button (gated)
- Server-side: Fetches contractor + certifications, generates OpenGraph metadata, includes JSON-LD structured data

**Admin Queue:**
- Location: `app/admin/page.tsx`
- Triggers: Admin navigates to `/admin` (checked by `app/admin/layout.tsx`)
- Responsibilities: List pending applications, show all application data, approve/reject buttons
- Server action: Calls approveApplication() or rejectApplication() based on button

**User Profile Dashboard:**
- Location: `app/profile/page.tsx`
- Triggers: Authenticated user clicks "@username" in nav or navigates to `/profile`
- Responsibilities: 3-tab interface (Profile: avatar upload, Posts: create/manage posts, Settings: username/password change)
- Client-side: Heavy state management (avatar upload progress, post form state, settings messages)

**Explore/Social Feed:**
- Location: `app/explore/page.tsx`
- Triggers: Authenticated user clicks "Explore" in nav or navigates to `/explore`
- Responsibilities: Display social feed (Social tab), Q&A feed (Q&A tab), example posts if no real posts exist
- Server-side: Fetches posts by category, joins with profiles and contractors

**Public User Profile:**
- Location: `app/u/[username]/page.tsx`
- Triggers: User navigates to `/u/@handle`
- Responsibilities: Display public-facing profile (posts, avatar, username, contractor info if linked)
- Server-side: Fetches profile by username, contractor info if user is contractor

**Authentication Page:**
- Location: `app/auth/page.tsx`
- Triggers: User navigates to `/auth`, redirected by auth guard layout
- Responsibilities: Sign in / Sign up toggle, email/password form, redirect on success
- Client-side: Handles auth submission via Supabase Auth client

**Password Reset:**
- Location: `app/auth/reset/page.tsx` (request), `app/auth/update-password/page.tsx` (redirect target)
- Triggers: User clicks "Forgot password?" on `/auth`
- Responsibilities: Send password reset email, handle token in redirect, update password
- Pattern: Supabase Auth flow (resetPasswordForEmail → email link → updateUser)

## Error Handling

**Strategy:** Defensive, minimal - mostly rely on Supabase RLS to prevent bad queries.

**Patterns:**

- **Server components:** Catch fetch errors in try/catch (or leave undefined), render fallback UI (empty state, "No results")
  - Example: `app/contractors/page.tsx` renders empty state if contractors query returns empty
  - Example: `/contractors/[id]/page.tsx` calls `notFound()` if contractor not found

- **Client components:** Use try/catch on async operations, set error state, display error message
  - Example: `app/apply/page.tsx` catches upload errors, displays message, allows retry
  - Example: `app/profile/page.tsx` catches avatar upload errors in modal

- **API routes:** Return JSON error with status code
  - Example: `/api/contact/[id]/route.ts` returns 401 if no token, 403 if not approved, 404 if contractor not found

- **Server actions:** Log errors to console (caught by Next.js), rely on page revalidation to sync state
  - Example: `approveApplication()` catches email send failure, logs it, continues (non-blocking)

- **Database constraints:** RLS policies prevent unauthorized data access
  - Only logged-in users can view contractor contact info (ContactSection → /api/contact validates approval status)
  - Admins can only approve/reject via server action with server-only client (RLS bypassed)

- **No global error boundary:** Each route handles its own errors

## Cross-Cutting Concerns

**Logging:**
- Console.log only for debugging (errors, admin actions)
- Example: `app/admin/page.tsx` logs `'[admin] rows: X'` and fetch errors
- No centralized logger (suitable for MVP)

**Validation:**

- Client-side: Form validation in React components (required fields, type checking, file size/type for uploads)
  - Example: `app/apply/page.tsx` validates trade selection, email format, password length, document types
  - Example: `components/SearchFilters.tsx` validates search input against trade/state options

- Server-side: Supabase RLS policies enforce data isolation
  - Contact info only visible to approved contractors (checked in `/api/contact/[id]`)
  - Admin actions use server-only client (guarantees RLS-bypass only on server)

- Database: Foreign keys, column constraints (NOT NULL, unique on username, etc.)

**Authentication:**

- Pattern: Supabase Auth (email/password, session via JWT)
- Session stored in browser localStorage (managed by supabase-js client)
- Protected routes check `getSession()` in useEffect, redirect to `/auth` if no session
- Admin access: Controlled via `NEXT_PUBLIC_ADMIN_EMAILS` env var, checked in `app/admin/layout.tsx`

**Authorization:**

- Contractor access to directory: Must have approved contractor profile (checked in `/contractors/layout.tsx`)
- Admin access to `/admin`: Must be in `NEXT_PUBLIC_ADMIN_EMAILS` list
- Contact info disclosure: Must be approved contractor (checked in `/api/contact/[id]`)
- RLS policies in Supabase ensure data is filtered by auth context (server-side enforcement)

**Caching:**

- Static pages: `export const revalidate = 3600` on homepage (1 hour cache)
- Dynamic pages: `export const dynamic = 'force-dynamic'` on search/filter pages (no cache, fresh data each request)
- Mutations: `revalidatePath()` after server actions to clear Next.js cache and refetch affected pages

---

*Architecture analysis: 2026-03-04*
