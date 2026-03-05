# Phase 5: Founding Cohort Onboarding - Research

**Researched:** 2026-03-04
**Domain:** Next.js App Router (client components, server actions, URL params), Supabase Auth, Resend email, operational runbook
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Cert editing (admin/contractors/[id])
- Add inline **Edit** button to each cert row on the cert management page
- Clicking Edit expands the cert row into an editable form in place (no modal, no new page)
- Edit form includes all fields: name, issuing body, cert number, expiry date, verified (checkbox)
- Admin manually controls the `verified` flag — no auto-flip on edit
- Auto-created certs start as `verified=true`; admin uses the checkbox to change this if needed
- Edit saves via a new `updateCertification()` server action in `/admin/contractors/[id]/actions.ts`

#### Post-approval welder experience
- **Email fix (confirmed production bug):** `NEXT_PUBLIC_APP_URL` in Vercel is set incorrectly (pointing to localhost). Must be set to `https://contractors-connect.vercel.app` in the Vercel dashboard. All email links (approval, rejection, password reset) read from this env var.
- **Approval email CTA updated:** Change the "Sign In Now" button link from `/auth` to `/auth?redirect=/profile` so welders land on their profile page immediately after authenticating.
- **First-sign-in redirect:** After an approved contractor signs in with no avatar set (`avatar_url is null`), they are redirected to `/profile`. No new DB column — use `avatar_url null` as the proxy for "first-time setup."
- **Welcome banner:** A dismissible banner at the top of `/profile` page for approved contractors with no avatar. Text: "Welcome to Contractors Connect — complete your profile to appear in the directory." Disappears once they upload a photo. Shown to approved contractors only (not pending users).

#### Invite-only soft gate on /apply
- Add a banner at the **top of /apply page**, above the form (does not block form submission)
- Banner text: "Contractors Connect is currently onboarding by invitation. If you were referred by someone, fill out the form below. To request an invite, email [CONTACT_EMAIL]."
- Contact email: use a placeholder env var `NEXT_PUBLIC_CONTACT_EMAIL` — co-founder will set this to their personal email in Vercel. Easy to swap later when a domain is set up.
- No hard gate, no code required to access the form — just a message to signal exclusivity

#### Operational runbook
- Outreach method: mix of direct text/call (personal contacts) and group chat (trade groups)
- Main expected friction: welders need time to gather documents before applying (AWS cert, insurance proof, license). Outreach message should mention this upfront.
- Include two message templates in the runbook:
  1. **Direct text/DM template** — personal tone, explains what it is, links to /apply, lists what docs they'll need
  2. **Group chat template** — slightly more brief, announces the platform, includes /apply link
- No follow-up template — co-founder handles follow-ups manually

### Claude's Discretion
- Exact welcome banner copy and dismiss behavior (sessionStorage vs. button close)
- How `/auth?redirect=/profile` is handled — whether the auth page reads the `redirect` param after sign-in and routes accordingly
- Whether the redirect check runs in `app/auth/page.tsx` client-side or in a middleware
- Exact inline edit UI for cert rows (expand animation, save/cancel buttons)
- Order of operations in the runbook (e.g., set up NEXT_PUBLIC_APP_URL first, then test, then reach out)

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope
</user_constraints>

---

## Summary

Phase 5 is primarily operational, not architectural. It has no new v1 requirements to implement — it validates that phases 1-4 work correctly under real conditions by running 20-50 real welders through the existing application and approval flow. However, a confirmed production bug (approval email pointing to localhost) and four small feature gaps (inline cert edit, first-sign-in redirect, welcome banner, /apply soft gate) must be fixed before outreach begins.

All five deliverables are well-scoped and touch existing files rather than introducing new patterns. The highest-risk item is the approval email URL bug — it is confirmed in the field and blocks the entire cohort flow. Everything else is incremental polish. The operational runbook is a markdown document (no code), and its primary value is in the message templates and ordered setup checklist.

**Primary recommendation:** Fix the `NEXT_PUBLIC_APP_URL` Vercel env var and update the approval email CTA href first, verify end-to-end in staging, then build the four code deliverables, then write the runbook and begin outreach.

---

## Standard Stack

### Core (already in use — no new dependencies)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js App Router | 14 | Routing, server actions, URL search params | Already in use |
| Supabase JS | current | Auth session, profile/contractor queries | Already in use |
| Tailwind CSS | current | Styling inline edit form and banners | Already in use |
| React (useState, useEffect) | 18 | Client component state for inline edit and banner dismiss | Already in use |

### No New Packages Required

All deliverables use existing dependencies. No `npm install` is needed for this phase. The inline cert edit form reuses the same Tailwind input classes already on the "Add Certification" form. The redirect logic uses `useSearchParams` from `next/navigation` (already available in the client component at `app/auth/page.tsx`).

---

## Architecture Patterns

### Pattern 1: Reading URL Search Params in a Client Component

The auth page at `app/auth/page.tsx` is already a `'use client'` component. After a successful `signInWithPassword`, instead of hardcoding `window.location.href = '/contractors'`, read the `redirect` search param and route there if present, otherwise fall back to `/contractors`.

**What:** Use `useSearchParams()` from `next/navigation` to read `?redirect=` on the auth page.
**When to use:** Any time a page needs to conditionally redirect after an action based on URL state.

```typescript
// Source: Next.js App Router docs — useSearchParams
'use client'
import { useSearchParams } from 'next/navigation'

// Inside AuthPage component:
const searchParams = useSearchParams()
const redirect = searchParams.get('redirect') ?? '/contractors'

// After successful signInWithPassword:
window.location.href = redirect
```

**Important:** `useSearchParams()` requires the component to be wrapped in a `<Suspense>` boundary when used in a page — however, `app/auth/page.tsx` is already a leaf client component with no static shell, so this is safe. If Next.js build errors on this, wrap the auth page content in `<Suspense fallback={null}>`.

### Pattern 2: Inline Expand/Collapse Edit Form (Client Component Inside Server Page)

The cert management page (`app/admin/contractors/[id]/page.tsx`) is a server component. It cannot hold interactive state. The inline edit UI requires client state (open/closed, form field values). The pattern is to extract the cert list into a new `CertRow` client component that owns its own expand state, while the parent page remains a server component.

**What:** Create `app/admin/contractors/[id]/CertRow.tsx` as a client component. Import it into the server page. Each row manages its own `isEditing` boolean and controlled form inputs locally.

**When to use:** Any time a server component page needs interactive per-item behavior (expand, edit-in-place) without converting the whole page to client.

```typescript
// Source: Next.js App Router docs — Server and Client component composition
// app/admin/contractors/[id]/CertRow.tsx
'use client'
import { useState } from 'react'
import { updateCertification } from './actions'
import type { Certification } from '@/lib/types'

export function CertRow({ cert, contractorId }: { cert: Certification; contractorId: string }) {
  const [isEditing, setIsEditing] = useState(false)
  // ... controlled inputs for each field
}
```

The existing `deleteCertification` inline server action in the page (`action={async () => { 'use server'; ... }}`) will need to move into `actions.ts` now that the row is a client component — client components cannot define inline `'use server'` actions directly; they must import them from a server actions file. This is already the pattern used by `addCertification` and `deleteCertification` in `actions.ts`.

**Correction to existing code:** The current `app/admin/contractors/[id]/page.tsx` line 58-63 uses an inline `'use server'` action inside the JSX. This works today because the parent is a server component. Once `CertRow` becomes a client component, this inline form must be replaced with an imported `deleteCertification` from `actions.ts` (which already exists and is identical).

### Pattern 3: Server Action for Update

Following the existing `addCertification` and `deleteCertification` pattern exactly:

```typescript
// Source: existing app/admin/contractors/[id]/actions.ts pattern
'use server'

export async function updateCertification(
  certId: string,
  fields: {
    name: string
    issuing_body: string
    cert_number: string | null
    expiry_date: string | null
    verified: boolean
  },
  contractorId: string
) {
  const admin = getSupabaseAdmin()
  await admin.from('certifications').update(fields).eq('id', certId)
  revalidatePath(`/admin/contractors/${contractorId}`)
  revalidatePath(`/contractors/${contractorId}`)
}
```

### Pattern 4: Conditional Welcome Banner

The profile page already has an onboarding banner pattern (lines 277-292 of `app/profile/page.tsx`). The banner condition is already wired to `contractor` (approved status) and `!profile?.avatar_url`. The existing banner text and dismiss behavior are Claude's discretion.

**Dismiss options analyzed:**

| Approach | Behavior | Tradeoff |
|----------|----------|----------|
| Disappear on avatar upload (automatic) | Banner hides once `profile.avatar_url` becomes non-null | Zero friction; happens organically; no dismiss button needed |
| sessionStorage dismiss button | Banner hides for the session when button clicked | Adds complexity; user can upload photo and still see banner momentarily |
| No explicit dismiss | Banner disappears only after avatar uploaded | Simplest; matches CLAUDE.md "do less" philosophy |

**Recommendation:** No explicit dismiss button. The existing onboarding banner already disappears when `avatar_url` is set (because the condition is `!profile?.avatar_url`). The CONTEXT.md decision states "disappears once they upload a photo" — this is already what the current code produces. The banner just needs updated copy and should also check `contractor?.status === 'approved'` explicitly (currently implied by `contractor` being non-null since `loadContractor` filters for `status = 'approved'`).

### Pattern 5: Static Info Banner on /apply

The `/apply` page is a client component. A static banner requires no state — it is always visible, never dismissible, and reads from `process.env.NEXT_PUBLIC_CONTACT_EMAIL`.

```typescript
// Add at the top of the return JSX in app/apply/page.tsx, before the form
{process.env.NEXT_PUBLIC_CONTACT_EMAIL && (
  <div className="mb-8 rounded-lg border border-slate-700 bg-slate-800/60 px-5 py-4 text-sm text-slate-300">
    <strong className="text-slate-100">Invite-only onboarding:</strong>{' '}
    Contractors Connect is currently onboarding by invitation. If you were referred,
    fill out the form below. To request an invite, email{' '}
    <a
      href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}`}
      className="text-amber-400 hover:text-amber-300"
    >
      {process.env.NEXT_PUBLIC_CONTACT_EMAIL}
    </a>
    .
  </div>
)}
```

**Note:** `NEXT_PUBLIC_*` env vars are embedded at build time in Next.js. If the banner needs to appear before the env var is set, guard with the conditional above so it fails gracefully (no banner, no error).

### Anti-Patterns to Avoid

- **Converting the entire cert management page to a client component:** Unnecessary — only the cert rows need interactivity. Keep the page as a server component and extract `CertRow` as a client leaf.
- **Adding a new database column for "first sign-in":** The CONTEXT.md decision explicitly uses `avatar_url is null` as the proxy. Adding a column would require a migration and is over-engineered.
- **Using Next.js middleware for the redirect:** The CONTEXT.md notes this as Claude's discretion. The auth page approach (client-side, read `useSearchParams`, route after sign-in) is simpler and sufficient. Middleware adds complexity and a harder-to-debug code path for a one-time onboarding redirect.
- **Hardcoding the contact email:** Always use `NEXT_PUBLIC_CONTACT_EMAIL` env var so the co-founder can change it without a code deploy.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| URL param reading | Manual `window.location.search` parsing | `useSearchParams()` from `next/navigation` | Built into App Router; handles encoding, SSR safety |
| Cache invalidation after cert update | Manual fetch triggers or state reset | `revalidatePath()` in server action | Already the established pattern; handles both admin and public pages atomically |
| Email URL construction | String concatenation in multiple places | `APP_URL` constant at top of `lib/email.ts` | Already implemented; one fix point |

---

## Common Pitfalls

### Pitfall 1: Inline `'use server'` Actions in Client Components
**What goes wrong:** Moving cert rows to a `CertRow` client component while leaving the delete `action={async () => { 'use server'; ... }}` inline causes a build error. Client components cannot define inline server actions.
**Why it happens:** Next.js App Router allows inline server actions only inside server components.
**How to avoid:** Import `deleteCertification` from `actions.ts` (already exists) instead of defining it inline. The `CertRow` client component calls the imported action directly from its event handler or form action.
**Warning signs:** Build error: "It is not allowed to define inline 'use server' directives in client components."

### Pitfall 2: `useSearchParams()` Without Suspense Boundary
**What goes wrong:** Next.js 14 requires components using `useSearchParams()` to be wrapped in `<Suspense>`. Without it, the build or runtime throws an error about missing Suspense.
**Why it happens:** `useSearchParams()` is a dynamic API that opts the page into dynamic rendering.
**How to avoid:** Wrap the `AuthPage` component (or just the part that reads search params) in `<Suspense fallback={null}>` in `app/auth/page.tsx`. Since this is a leaf client component with no static content that needs to render instantly, a null fallback is fine.
**Warning signs:** Next.js build warning or runtime error about `useSearchParams` requiring Suspense.

### Pitfall 3: `NEXT_PUBLIC_APP_URL` Env Var Not Updated Before Testing
**What goes wrong:** Admin approves a test application; email arrives with `http://localhost:3000/auth?redirect=/profile`. Welder clicks link, goes to localhost, which is unreachable from their device.
**Why it happens:** Vercel env var was never updated from the development default.
**How to avoid:** Update `NEXT_PUBLIC_APP_URL` in Vercel dashboard FIRST, redeploy, then run a test application through the full flow before any real outreach.
**Warning signs:** Approval email link contains `localhost` in the href.

### Pitfall 4: Welcome Banner Showing for Pending Users
**What goes wrong:** A pending applicant (who has an approved contractor record from a previous approval attempt, hypothetically) or edge case user sees the "Welcome" banner.
**Why it happens:** The banner condition only checks `contractor !== null`. The `loadContractor` function already filters `status = 'approved'` so in practice this is safe, but should be explicit.
**How to avoid:** The banner condition `contractor && !profile?.avatar_url` is already correct because `loadContractor` queries with `.eq('status', 'approved')`. Document this assumption in a comment.

### Pitfall 5: `NEXT_PUBLIC_CONTACT_EMAIL` Not Set in Vercel Before Deploy
**What goes wrong:** The /apply banner either shows `undefined` as the email or throws.
**Why it happens:** The env var is new and the co-founder may not add it before the first deploy.
**How to avoid:** Guard with `{process.env.NEXT_PUBLIC_CONTACT_EMAIL && (...)}` so the banner is simply absent if the var is missing. Include this setup step as Step 1 in the runbook.

---

## Code Examples

### Existing Approval Email (before fix)
```typescript
// Source: lib/email.ts line 29
<a href="${APP_URL}/auth" ...>Sign In Now</a>
```

### After Fix (update href to include redirect param)
```typescript
// Source: lib/email.ts — update this href
<a href="${APP_URL}/auth?redirect=/profile" ...>Sign In Now</a>
```

### Auth Page Redirect After Sign-In (current behavior)
```typescript
// Source: app/auth/page.tsx line 25 — current hardcode
window.location.href = '/contractors'
```

### Auth Page Redirect After Sign-In (updated)
```typescript
// app/auth/page.tsx — after adding useSearchParams
import { useSearchParams } from 'next/navigation'

// In component:
const searchParams = useSearchParams()
const redirectTo = searchParams.get('redirect') ?? '/contractors'

// After successful sign-in:
window.location.href = redirectTo
```

### updateCertification Server Action
```typescript
// app/admin/contractors/[id]/actions.ts — add this alongside existing actions
'use server'

export async function updateCertification(
  certId: string,
  fields: {
    name: string
    issuing_body: string
    cert_number: string | null
    expiry_date: string | null
    verified: boolean
  },
  contractorId: string
) {
  const admin = getSupabaseAdmin()
  await admin.from('certifications').update(fields).eq('id', certId)
  revalidatePath(`/admin/contractors/${contractorId}`)
  revalidatePath(`/contractors/${contractorId}`)
}
```

### CertRow Client Component Pattern
```typescript
// app/admin/contractors/[id]/CertRow.tsx
'use client'
import { useState, useTransition } from 'react'
import { updateCertification, deleteCertification } from './actions'
import type { Certification } from '@/lib/types'

export function CertRow({ cert, contractorId }: { cert: Certification; contractorId: string }) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(cert.name)
  const [issuingBody, setIssuingBody] = useState(cert.issuing_body ?? '')
  const [certNumber, setCertNumber] = useState(cert.cert_number ?? '')
  const [expiryDate, setExpiryDate] = useState(cert.expiry_date ?? '')
  const [verified, setVerified] = useState(cert.verified)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    startTransition(async () => {
      await updateCertification(
        cert.id,
        {
          name,
          issuing_body: issuingBody,
          cert_number: certNumber || null,
          expiry_date: expiryDate || null,
          verified,
        },
        contractorId
      )
      setIsEditing(false)
    })
  }

  // render collapsed row with Edit/Remove buttons, or expanded edit form
}
```

---

## Operational Runbook Content

The runbook is a markdown file (`.planning/phases/05-founding-cohort-onboarding/RUNBOOK.md` or similar). Its sections:

### Setup Checklist (Order Matters)
1. Set `NEXT_PUBLIC_APP_URL=https://contractors-connect.vercel.app` in Vercel dashboard — redeploy
2. Set `NEXT_PUBLIC_CONTACT_EMAIL=<cofounders-email>` in Vercel dashboard — redeploy
3. Run a test: create a dummy account, submit application, approve via admin queue, confirm email link goes to production URL and includes `?redirect=/profile`, sign in, verify profile page loads with welcome banner
4. Confirm test contractor profile appears in `/contractors` directory
5. Only after full end-to-end test passes — begin outreach

### Direct Text/DM Template (example content for planner to finalize)
```
Hey [Name], I'm building a verified welding contractor network —
kind of like LinkedIn but just for tradespeople who can prove their creds.
You'd be one of the first on it.

You can apply at: https://contractors-connect.vercel.app/apply

You'll need: AWS cert or equivalent, state license (if you have one),
and proof of general liability insurance. Scan or photo is fine.

Takes about 5 minutes. Let me know if you have any questions.
```

### Group Chat Template (example content for planner to finalize)
```
Launching Contractors Connect — a verified-only directory for credentialed tradespeople.
No unverified accounts, no spam.

Applying is invite-only right now. If you're a certified welder with proof of insurance,
head here: https://contractors-connect.vercel.app/apply

You'll need your AWS cert / license / insurance docs ready to upload.
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Full page convert to client for interactivity | Extract only interactive leaves as client components, keep page server | Next.js 13+ App Router | Smaller JS bundles, server data fetching stays fast |
| `router.push()` after form action | `revalidatePath()` in server action, page re-renders with fresh data | Next.js 13+ | No client navigation needed; simpler mental model |

---

## Open Questions

1. **Suspense wrapper placement for `useSearchParams`**
   - What we know: Next.js 14 requires Suspense around components using `useSearchParams`
   - What's unclear: Whether `app/auth/page.tsx` as a fully client component still triggers the Suspense requirement (it may only apply in pages that mix server/client)
   - Recommendation: Add `<Suspense fallback={null}>` around the component body defensively; if build passes without it, remove

2. **Welcome banner copy exactness**
   - What we know: CONTEXT.md specifies "Welcome to Contractors Connect — complete your profile to appear in the directory"
   - What's unclear: Whether the existing onboarding banner (which already says "Complete your profile") should be replaced or augmented
   - Recommendation: Replace the existing `onboardingItems` list-based banner with a single dismissible/conditional banner using the specified copy; the existing pattern can be removed since the welcome banner covers the same case more warmly

3. **Runbook format/location**
   - What we know: The runbook is for the co-founder's personal use, not a user-facing page
   - What's unclear: Whether it lives in the repo or is delivered as a separate document
   - Recommendation: Deliver as a committed markdown file in `.planning/phases/05-founding-cohort-onboarding/RUNBOOK.md` — it belongs in the planning artifacts directory and can be referenced later

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected (no jest.config, vitest.config, or test directories found) |
| Config file | None — no Wave 0 test infrastructure exists |
| Quick run command | `npm run build` (build lint as proxy for correctness) |
| Full suite command | `npm run build && npm run lint` |

### Phase Requirements → Test Map

Phase 5 has no new v1 requirements (it is operational validation of phases 1-4). The deliverables are best verified manually:

| Deliverable | Behavior | Test Type | Verification Method |
|-------------|----------|-----------|---------------------|
| Email URL fix | Approval email links to production URL, not localhost | smoke | Manual: approve test application, inspect email href |
| Email redirect param | CTA href is `/auth?redirect=/profile` | smoke | Manual: inspect email source or rendered link |
| Auth redirect | After sign-in via `/auth?redirect=/profile`, lands on `/profile` | smoke | Manual: click link from email, sign in, observe page |
| Welcome banner | Appears on `/profile` for approved contractors with no avatar; disappears after upload | smoke | Manual: sign in as fresh approved contractor, observe banner, upload photo |
| Inline cert edit | Edit button expands form; save updates cert; cancel reverts | smoke | Manual: admin visits `/admin/contractors/[id]`, edits cert, verifies change in list and on public profile |
| /apply invite banner | Banner appears above form with contact email | smoke | Manual: visit `/apply`, observe banner text and email link |

### Sampling Rate
- **Per task commit:** `npm run build` — catch TypeScript and import errors
- **Per wave merge:** `npm run build && npm run lint`
- **Phase gate:** Full manual end-to-end flow (application → approval → email → sign-in → profile) before `/gsd:verify-work`

### Wave 0 Gaps
- No test infrastructure exists and no new automated tests are required for this operational phase. Manual smoke testing covers all deliverables.

---

## Sources

### Primary (HIGH confidence)
- Direct code inspection of `app/auth/page.tsx`, `app/profile/page.tsx`, `app/apply/page.tsx`, `app/admin/contractors/[id]/page.tsx`, `app/admin/contractors/[id]/actions.ts`, `lib/email.ts` — current implementation confirmed
- `05-CONTEXT.md` — all locked decisions confirmed and copied verbatim

### Secondary (MEDIUM confidence)
- Next.js App Router docs pattern: `useSearchParams` requires Suspense in Next.js 14 — well-established and verified by community consensus; exact behavior in fully-client pages may vary

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new dependencies; all patterns from existing codebase
- Architecture: HIGH — all patterns are extensions of already-working code in the repo
- Pitfalls: HIGH — identified from direct code inspection and confirmed production bug report
- Operational runbook: HIGH — content derived from CONTEXT.md decisions; templates are discretionary

**Research date:** 2026-03-04
**Valid until:** 2026-04-04 (stable codebase, no fast-moving dependencies)
