# Phase 5: Founding Cohort Onboarding - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Run the first 20-50 welders through the existing application and approval flow end-to-end. No new v1 requirements — this phase validates phases 1-4 under real conditions. Deliverables are: a bug fix to the approval email URL, a first-sign-in redirect + welcome banner, an inline cert edit capability for admin, and an invite-only soft gate on /apply. Plus an operational runbook for the co-founder.

</domain>

<decisions>
## Implementation Decisions

### Cert editing (admin/contractors/[id])
- Add inline **Edit** button to each cert row on the cert management page
- Clicking Edit expands the cert row into an editable form in place (no modal, no new page)
- Edit form includes all fields: name, issuing body, cert number, expiry date, verified (checkbox)
- Admin manually controls the `verified` flag — no auto-flip on edit
- Auto-created certs start as `verified=true`; admin uses the checkbox to change this if needed
- Edit saves via a new `updateCertification()` server action in `/admin/contractors/[id]/actions.ts`

### Post-approval welder experience
- **Email fix (confirmed production bug):** `NEXT_PUBLIC_APP_URL` in Vercel is set incorrectly (pointing to localhost). Must be set to `https://contractors-connect.vercel.app` in the Vercel dashboard. All email links (approval, rejection, password reset) read from this env var.
- **Approval email CTA updated:** Change the "Sign In Now" button link from `/auth` to `/auth?redirect=/profile` so welders land on their profile page immediately after authenticating.
- **First-sign-in redirect:** After an approved contractor signs in with no avatar set (`avatar_url is null`), they are redirected to `/profile`. No new DB column — use avatar_url null as the proxy for "first-time setup."
- **Welcome banner:** A dismissible banner at the top of `/profile` page for approved contractors with no avatar. Text: "Welcome to Contractors Connect — complete your profile to appear in the directory." Disappears once they upload a photo. Shown to approved contractors only (not pending users).

### Invite-only soft gate on /apply
- Add a banner at the **top of /apply page**, above the form (does not block form submission)
- Banner text: "Contractors Connect is currently onboarding by invitation. If you were referred by someone, fill out the form below. To request an invite, email [CONTACT_EMAIL]."
- Contact email: use a placeholder env var `NEXT_PUBLIC_CONTACT_EMAIL` — co-founder will set this to their personal email in Vercel. Easy to swap later when a domain is set up.
- No hard gate, no code required to access the form — just a message to signal exclusivity

### Operational runbook
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

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/admin/contractors/[id]/page.tsx`: existing cert list with Remove button — add Edit button alongside Remove in each cert row
- `app/admin/contractors/[id]/actions.ts`: `addCertification()` and `deleteCertification()` already exist — add `updateCertification(certId, fields, contractorId)` here
- `lib/email.ts`: `APP_URL` reads from `NEXT_PUBLIC_APP_URL` env var with fallback `https://contractorsconnect.com` — fix the Vercel env var; also update approval email CTA href to include `?redirect=/profile`
- `app/profile/page.tsx`: 3-tab dashboard — add welcome banner here, gated to `status === 'approved' && !avatar_url`
- `app/apply/page.tsx`: add invite-only banner as a static info block at the very top of the JSX, above the form

### Established Patterns
- Server actions in `/admin/` use `revalidatePath()` after mutations — follow same pattern for `updateCertification`
- Admin cert page is a server component — the Edit form will need to be a client component (inline state for open/closed)
- Profile page currently fetches contractor + profile data at load — status and avatar_url are already available to drive the banner condition
- Auth page at `app/auth/page.tsx` is a client component using `supabase.auth.signInWithPassword()` — it can read a `redirect` search param and route after successful sign-in

### Integration Points
- `certifications` table: `id`, `contractor_id`, `name`, `issuing_body`, `cert_number`, `expiry_date`, `verified`, `document_url` — all editable fields are already present, no migration needed
- Vercel dashboard: `NEXT_PUBLIC_APP_URL` env var must be updated (not a code change — operational step)
- `NEXT_PUBLIC_CONTACT_EMAIL` env var: new, must be added to Vercel dashboard before /apply banner goes live

</code_context>

<specifics>
## Specific Ideas

- **Bug confirmed in the field:** A real welder signed up and the approval email linked to localhost. This must be fixed before any more cohort outreach.
- The invite-only banner should feel human and warm, not corporate/gatekeeping — these are tradespeople who know the co-founder personally.
- Cert inline edit should feel consistent with the existing card design on the page (dark slate background, slate borders) — no visual jarring.

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-founding-cohort-onboarding*
*Context gathered: 2026-03-04*
