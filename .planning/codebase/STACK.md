# Technology Stack

**Analysis Date:** 2026-03-04

## Languages

**Primary:**
- TypeScript 5.6.3 - Used throughout codebase (all `.ts` and `.tsx` files)

**Runtime HTML/CSS:**
- JSX/TSX - React component templates
- CSS (via Tailwind utility classes)

## Runtime

**Environment:**
- Node.js (version specified via Vercel deployment, not locked locally)

**Package Manager:**
- npm (version 10+, inferred from package-lock.json)
- Lockfile: `package-lock.json` present at project root

## Frameworks

**Core:**
- Next.js 14.2.18 - Full-stack web framework with App Router
  - Used for: Pages, API routes, server-side rendering, authentication integration
  - Key config: `next.config.js` at project root
  - TypeScript config: `tsconfig.json`

**UI Rendering:**
- React 18.3.1 - Component library
- React DOM 18.3.1 - DOM rendering

**Styling:**
- Tailwind CSS 3.4.14 - Utility-first CSS framework
  - Config: `tailwind.config.ts`
  - PostCSS integration: `postcss.config.js`

**CSS Processing:**
- PostCSS 8.4.47 - CSS transformation tool
- Autoprefixer 10.4.20 - Vendor prefix injection for cross-browser compatibility

## Key Dependencies

**Critical:**
- @supabase/supabase-js 2.45.4 - Supabase JavaScript client
  - Purpose: Database queries, authentication, file storage operations
  - Used in: `lib/supabase.ts`, `lib/supabase-admin.ts`, throughout app
  - Two clients: browser-safe (respects RLS) and admin (service role, bypasses RLS)

- resend 6.9.3 - Email delivery service SDK
  - Purpose: Send transactional emails (contractor approval/rejection notifications)
  - Used in: `lib/email.ts`
  - Functions: `sendApprovalEmail()`, `sendRejectionEmail()`

**Infrastructure:**
- server-only 0.0.1 - Package for marking server-only modules
  - Purpose: Prevents accidental import of server code into client bundles
  - Used in: `lib/supabase-admin.ts`, `lib/email.ts`

**Development:**
- TypeScript 5.6.3 - Language compiler
- @types/node 20.x - Node.js type definitions
- @types/react 18.x - React type definitions
- @types/react-dom 18.x - React DOM type definitions
- eslint 8.x - JavaScript/TypeScript linter
- eslint-config-next 14.2.18 - Next.js ESLint rules and configuration

## Configuration

**Environment:**
- Environment variables stored in `.env.local` (development)
- Required variables for deployment (see INTEGRATIONS.md for details):
  - `NEXT_PUBLIC_SUPABASE_URL` - Public Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public Supabase anonymous key
  - `SUPABASE_SERVICE_ROLE_KEY` - Private service role key (server-only)
  - `RESEND_API_KEY` - Private Resend API key (server-only)
  - `RESEND_FROM_EMAIL` - Email sender address (optional, defaults to noreply@contractorsconnect.com)
  - `NEXT_PUBLIC_APP_URL` - Production URL (optional, defaults to https://contractorsconnect.com)
  - `NEXT_PUBLIC_ADMIN_EMAILS` - Comma-separated admin email addresses
  - `NEXT_PUBLIC_CONTACT_EMAIL` - Public contact email shown on /apply page (optional)

**Build:**
- `next.config.js` - Next.js configuration (image optimization for Supabase CDN)
- Image remote patterns configured for `*.supabase.co` domain

## Platform Requirements

**Development:**
- Node.js 18+ (assumed, not pinned)
- npm with npm-lock support
- Modern TypeScript-aware editor recommended
- `.env.local` file with required variables

**Production:**
- Vercel deployment platform (as specified in CLAUDE.md)
- Supabase project (PostgreSQL database)
- Resend account for email delivery

---

*Stack analysis: 2026-03-04*
