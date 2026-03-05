# External Integrations

**Analysis Date:** 2026-03-04

## APIs & External Services

**Email Delivery:**
- Resend - Transactional email service
  - SDK/Client: `resend` npm package (6.9.3)
  - Auth: `RESEND_API_KEY` environment variable
  - Sender: `RESEND_FROM_EMAIL` (defaults to noreply@contractorsconnect.com)
  - Used in: `lib/email.ts` for approval/rejection notifications
  - Functions:
    - `sendApprovalEmail(to, name)` - Sent when admin approves a contractor application
    - `sendRejectionEmail(to, name)` - Sent when admin rejects an application
  - Email templates: HTML styled with inline CSS in `lib/email.ts` (lines 14-37, 46-64)

## Data Storage

**Primary Database:**
- Supabase (PostgreSQL)
  - Connection: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (browser client)
  - Admin access: `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (server-only)
  - Client libraries: `@supabase/supabase-js` (2.45.4)
  - Browser client: `lib/supabase.ts` - Respects Row Level Security
  - Admin client: `lib/supabase-admin.ts` - Bypasses RLS for server operations (service role)
  - Tables:
    - `contractors` - Verified contractor profiles (id, user_id, full_name, trade, specialties, location_city, location_state, years_experience, bio, phone, email, website, profile_photo_url, status, created_at)
    - `certifications` - Contractor credentials (id, contractor_id, name, issuing_body, cert_number, expiry_date, verified, document_url)
    - `applications` - Pending contractor applications (id, user_id, submitted_at, status, full_name, trade, specialties, location_city, location_state, years_experience, bio, phone, email, website, document_urls)
    - `profiles` - User profile metadata (id, username, avatar_url, updated_at)
    - `posts` - Social feed posts (id, user_id, contractor_id, content, image_url, link_url, category, created_at)
  - Migrations: 7 SQL migrations deployed in `/supabase/migrations/`
  - Row Level Security: Enabled on all tables for access control

**File Storage:**
- Supabase Storage (S3-compatible)
  - Buckets created via migrations:
    - `avatars` - Public read, authenticated write (contractor profile photos)
    - `post-images` - Public read, authenticated write (post attachments)
    - `application-docs` - Public read (via URL), strict per-user upload (credential documents)
  - File size limits: 10 MB per file in application-docs
  - Allowed MIME types in application-docs: PDF, JPEG, PNG, WebP
  - Accessed via Supabase JavaScript SDK in browser and server components
  - Storage policies defined in migrations 006 and 007

**Database Access Pattern:**
- Two-tier authentication:
  1. Browser client uses anon key + Supabase Auth session (RLS enforced)
  2. Server operations use service role key (RLS bypassed, used only for admin actions)

## Authentication & Identity

**Auth Provider:**
- Supabase Auth (built-in)
  - Implementation: Email + password authentication
  - Client: Supabase JS SDK (`lib/supabase.ts`)
  - Session management: Handled by Supabase Auth (JWT tokens)
  - Auth flow: Sign up at `/auth/page.tsx`, login/logout at same route
  - User reference: `auth.users` table in Supabase (1-to-1 with contractors via user_id FK)
  - Admin access: Controlled by `NEXT_PUBLIC_ADMIN_EMAILS` env var (email-based, checked in `/admin/layout.tsx`)

## Monitoring & Observability

**Error Tracking:**
- Not detected - No Sentry, Rollbar, or similar integrated

**Logs:**
- Browser: `console.log()` statements in client components
- Server: Node.js standard logging (no structured logging detected)
- No external log aggregation detected

## CI/CD & Deployment

**Hosting:**
- Vercel (as specified in CLAUDE.md)
- GitHub repo integration for auto-deployment (URL not specified in code)
- Production deployment: Connected via Vercel dashboard

**CI Pipeline:**
- Not detected - No GitHub Actions, GitLab CI, or similar workflows found in codebase
- Build command: `next build`
- Start command: `next start`

## Environment Configuration

**Required env vars for production:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (public, embedded in HTML)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (public, embedded in HTML)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (secret, server-only)
- `RESEND_API_KEY` - Resend email API key (secret, server-only)
- `NEXT_PUBLIC_ADMIN_EMAILS` - Comma-separated admin email addresses (public in code check, used in layout)
- `RESEND_FROM_EMAIL` - Sender email address (optional, defaults to noreply@contractorsconnect.com)
- `NEXT_PUBLIC_APP_URL` - Production URL (optional, defaults to https://contractorsconnect.com)
- `NEXT_PUBLIC_CONTACT_EMAIL` - Contact email shown on /apply (optional, no default)

**Secrets location:**
- Development: `.env.local` file (git-ignored)
- Production: Vercel environment variables (managed in Vercel dashboard)

**Build-time vars (embedded in HTML):**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_ADMIN_EMAILS`
- `NEXT_PUBLIC_CONTACT_EMAIL`

## Webhooks & Callbacks

**Incoming:**
- Supabase Auth redirect: `/auth/page.tsx` handles auth state changes
- No other webhook endpoints detected

**Outgoing:**
- Email notifications via Resend (transactional only, no webhooks)
- No outbound webhooks to external services detected

## Image Optimization

**CDN:**
- Supabase bucket URLs served through Supabase CDN
- Next.js Image component configured to allow `*.supabase.co` domain (next.config.js)
- Images are lazy-loaded and optimized by Next.js

## Database Migrations

**Migration System:**
- Manual SQL migrations (not ORM-based)
- Location: `/supabase/migrations/` directory
- Applied to production via Supabase CLI or dashboard
- Migrations completed: 007 total
- Key migration files:
  - `001_initial.sql` - Core schema (contractors, certifications, applications) + RLS
  - `002_profiles_posts.sql` - User profiles and posts tables
  - `003_posts_category.sql` - Posts category enum
  - `004_applications_user_id.sql` - Applications user_id foreign key
  - `005_rls_improvements.sql` - RLS refinements + search index
  - `006_application_documents.sql` - Document upload support + storage bucket
  - `007_storage_policies.sql` - Storage bucket RLS policies for avatars, post-images, application-docs

---

*Integration audit: 2026-03-04*
