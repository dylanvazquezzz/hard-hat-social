# Coding Conventions

**Analysis Date:** 2026-03-04

## Naming Patterns

**Files:**
- Components: `PascalCase` (e.g., `NavBar.tsx`, `ContractorCard.tsx`, `PostCard.tsx`)
- Pages: `kebab-case` for route segments in app directory (e.g., `/apply`, `/explore`, `/jobs`)
- TypeScript types/interfaces: `PascalCase` (e.g., `Contractor`, `FormState`, `Props`)
- Constants: `UPPER_CASE` (e.g., `TRADES`, `US_STATES`, `MAX_DOCS`, `ACCEPTED_DOC_TYPES`)
- Server actions: `camelCase` function names in `actions.ts` files (e.g., `approveApplication`, `rejectApplication`, `handleChange`)

**Functions:**
- Handlers: prefix with `handle` (e.g., `handleChange`, `handleSubmit`, `handleAvatarUpload`, `handleSignOut`)
- Data loaders: prefix with `load` (e.g., `loadProfile`, `loadContractor`, `loadPosts`)
- Fetchers: prefix with `fetch` (e.g., `fetchUsername`)
- Toggle/update filter logic: prefix with `update` (e.g., `updateFilter`)
- API responses in Route Handlers: `GET`, `POST`, `PUT`, `DELETE` (capitalized)

**Variables:**
- Local state: `camelCase` (e.g., `form`, `loading`, `message`, `dropdownOpen`)
- Boolean state: prefix with `is`, `has`, or `show` (e.g., `isApproved`, `hasFilters`, `showAuthor`)
- React state setters: `setState` or `set{PropertyName}` (e.g., `setSession`, `setUsername`, `setLoading`)
- Props interface: `Props` (not `ComponentProps`)
- Form state types: `FormState` (e.g., in `/apply/page.tsx`)

**Types & Interfaces:**
- Database entities: match table names (e.g., `Contractor`, `Certification`, `Application`, `Profile`, `Post`)
- Status enums: `ContractorStatus = 'pending' | 'approved' | 'rejected'`
- Category types: `'social' | 'qa' | 'jobs'`
- Tab types: `'profile' | 'posts' | 'settings'`
- Mode types: `'signin' | 'signup'`

## Code Style

**Formatting:**
- Prettier formatting enforced via `next lint`
- 2-space indentation throughout
- Semicolons required at end of statements
- Single quotes for strings (enforced by ESLint config)
- No trailing commas except in multi-line objects/arrays

**Linting:**
- ESLint: `next/core-web-vitals` configuration
- Config: `.eslintrc.json` extends NextJS defaults
- Run: `npm run lint` (Next.js built-in linter)

**Import Organization:**

1. External packages (React, Next.js, third-party libraries)
2. Internal imports with path aliases (`@/`)
3. Type imports separated where used

Example from `/app/profile/page.tsx`:
```typescript
'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import type { Profile, Post, Contractor } from '@/lib/types'
import type { User } from '@supabase/supabase-js'
```

**Path Aliases:**
- Single alias: `@/*` maps to project root
- All internal imports use `@/` pattern
- Prevents relative path imports (`../../../`)

## Client vs Server Boundaries

**'use client' directive:**
- Applied at top of interactive components
- Applied when component uses React hooks (`useState`, `useEffect`, `useRef`)
- Applied when component reads `useRouter` or `useSearchParams`
- Examples: `NavBar.tsx`, `SearchFilters.tsx`, `AuthPage`, all tab-based UIs

**Server Components (default):**
- Page components that fetch data (e.g., `/contractors/page.tsx`)
- Pages decorated with `export const dynamic = 'force-dynamic'` to bypass caching
- Use `getSupabaseAdmin()` from `lib/supabase-admin.ts` for server-side queries
- `Suspense` boundaries used for split client/server sections (e.g., in `/auth/page.tsx`)

**'use server' directive:**
- Applied to server action functions (e.g., `/app/admin/actions.ts`)
- Used for mutations requiring service role access
- Functions exported directly, not in request handlers

## Error Handling

**Client-side patterns:**
- Errors captured in local state (e.g., `error`, `message`, `settingsMsg`)
- Display errors as inline `<div>` with error styling (border-red-800, bg-red-900/20, text-red-400)
- Async operations: set `loading` state, clear errors, handle response
- Alert fallback for critical failures (e.g., `alert('Upload failed: ' + uploadErr.message)`)

Example from `/app/profile/page.tsx`:
```typescript
if (uploadErr) {
  alert('Upload failed: ' + uploadErr.message)
  setAvatarUploading(false)
  return
}
```

**Server-side patterns:**
- Server actions use `try`/`catch` implicitly via Supabase SDK
- Errors logged to console with prefixes like `[email]` or `[auth]`
- Non-blocking failures caught and logged without re-throwing (see `sendApprovalEmail` in `/app/admin/actions.ts`)
- API routes return `NextResponse.json()` with explicit status codes (401, 403, 404, 500)

Example from `/app/api/contact/[id]/route.ts`:
```typescript
if (!token) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

**Database errors:**
- Errors destructured from Supabase response (e.g., `{ data, error }`)
- Null/undefined checks on data before use
- Type casting applied after null check (e.g., `app as Application`)

## Logging

**Framework:** Console logging (no external logging library)

**Patterns:**
- Errors logged with context prefix: `console.error('[context] message:', error)`
- Example: `console.error('[email] approval send failed:', err)`
- Example: `console.error('Error fetching contractors:', error)`
- No logging of sensitive data (passwords, auth tokens)
- Graceful degradation when logging fails

## Comments

**When to Comment:**
- Explain non-obvious business logic or workarounds
- Document why a particular approach was taken
- Clarify complex RLS policy requirements or auth flows
- Explain edge cases (e.g., email lookup fallback in `approveApplication`)

Example from `/app/apply/page.tsx`:
```typescript
// Generate ID client-side so we never need to SELECT after insert.
// Avoids hitting the SELECT RLS policy (which requires auth.uid()) for anon users.
const appId = crypto.randomUUID()
```

Example from `/app/api/contact/[id]/route.ts`:
```typescript
// Check if requesting user is an approved contractor (by user_id, fallback to email)
```

**JSDoc/TSDoc:**
- Not heavily used; TypeScript interfaces provide documentation
- Used for complex helper functions
- No requirement for function-level JSDoc comments

## Function Design

**Size guideline:**
- Prefer small, focused functions (< 50 lines for event handlers)
- Longer functions break into smaller helpers (e.g., `loadProfile`, `loadContractor` in `/profile/page.tsx`)

**Parameters:**
- Destructure props in functional components: `export default function NavBar() {}`
- Use destructuring for function parameters: `({ data: { session } }) =>` pattern common
- Props type defined explicitly as `interface Props { ... }`

**Return Values:**
- Early returns used for error/validation checks
- Render conditional UI directly (ternary, `&&` operators)
- No explicit null returns; component render returns JSX

## Module Design

**Exports:**
- Named exports for utility functions (e.g., `sendApprovalEmail`, `sendRejectionEmail`)
- Default exports for React components
- Server-only modules marked with `import 'server-only'` (e.g., `/lib/email.ts`, `/lib/supabase-admin.ts`)

Example from `/lib/supabase-admin.ts`:
```typescript
import 'server-only'
// SERVER ONLY — never import this in client components.
export function getSupabaseAdmin() { ... }
```

**Barrel Files:**
- Not used in this project
- Types exported from `lib/types.ts` as single file
- Components imported directly from component directory

## Tailwind CSS Conventions

**Spacing & Layout:**
- Responsive classes: `sm:`, `lg:`, `md:` prefixes
- Max-width containers: `max-w-7xl`, `max-w-2xl`
- Padding: consistent use of `px-4 py-10 sm:px-6 lg:px-8`
- Gaps: `gap-3`, `gap-4`, `gap-6` for spacing items

**Colors:**
- Dark theme throughout (slate-900, slate-800 for backgrounds)
- Accent color: `amber-500` (brand color, matching project theme)
- Error states: `red-400`, `red-800`, `red-900/20`
- Success states: `emerald-400`, `emerald-900/50`
- Inactive/subtle: `slate-500`, `slate-400`

**Typography:**
- Headings: `text-3xl font-bold`, `text-2xl font-bold`, `text-lg font-semibold`
- Body: `text-sm`, `text-xs` for secondary info
- Emphasis: `font-semibold`, `font-medium`, `font-bold`

**Interactive Elements:**
- Buttons: `bg-amber-500 hover:bg-amber-400 transition-colors`
- Disabled: `disabled:cursor-not-allowed disabled:opacity-50`
- Focus states: `focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500`
- Hover states: explicit `hover:` classes (no global CSS)

## Database & Supabase Patterns

**Client Queries:**
- Use `supabase` from `lib/supabase.ts` (browser-safe, respects RLS)
- Never import admin client in browser code
- Queries destructure response: `const { data, error } = await supabase...`
- Type cast data after null check: `(data as Contractor[]) ?? []`

**Server Queries:**
- Use `getSupabaseAdmin()` from `lib/supabase-admin.ts` in server actions
- Admin client bypasses RLS for mutations (approvals, rejections)
- Non-blocking failures caught gracefully: `promise.catch(err => console.error(...))`

Example pattern from `/app/admin/actions.ts`:
```typescript
const admin = getSupabaseAdmin()
const { data: app } = await admin.from('applications').select('*').single()
```

**RLS Enforcement:**
- Contact info (phone/email) protected by RLS on `contractors` table
- API endpoint `/api/contact/[id]/route.ts` checks approval status before returning contact info
- Profiles have cascading delete on auth.users (FK constraint)

## React Patterns

**Hooks Usage:**
- `useState` for local component state
- `useEffect` for side effects, auth checks, cleanup
- `useRef` for form inputs, DOM elements, cleanup subscriptions
- `useRouter`, `useSearchParams` for navigation and query params
- `useCallback` with dependencies for memoized handlers (e.g., `updateFilter` in SearchFilters)

**Conditional Rendering:**
- Ternary operators for simple binary conditions
- `&&` for render-or-hide patterns
- Early returns in component body for full-page states (e.g., `if (loading) return null`)

Example from `/app/profile/page.tsx`:
```typescript
if (loading) return null
if (isPending) { return <div>...</div> }
return <div>...</div>
```

**State Management:**
- Single source of truth per component
- Parent passes props down, child calls handlers
- Form state as single object: `const [form, setForm] = useState<FormState>({ ... })`
- Spread operator for updates: `setForm(prev => ({ ...prev, [name]: value }))`

---

*Convention analysis: 2026-03-04*
