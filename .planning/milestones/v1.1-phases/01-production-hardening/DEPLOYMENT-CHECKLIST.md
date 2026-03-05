# Phase 1: Production Deployment Checklist

Complete these steps in order. Start with Resend domain verification first — DNS propagation takes up to 48 hours.

Production URL: https://contractors-connect.vercel.app

---

## Step 1: Start Resend Domain Verification (PROD-01)

**Do this first — DNS propagation takes up to 48 hours.**

The sending domain for approval/rejection emails is in `lib/email.ts`:
```
const FROM = process.env.RESEND_FROM_EMAIL ?? 'noreply@contractorsconnect.com'
```

**Action:** Verify the domain that appears in your `RESEND_FROM_EMAIL` env var (check Vercel dashboard). If the env var is not set, the domain to verify is `contractorsconnect.com`.

1. Go to [Resend Dashboard](https://resend.com/domains) → **Domains** → **Add Domain**
2. Enter the sending domain (e.g. `contractorsconnect.com`)
3. Resend will display DNS records to add — copy them
4. Add to your DNS provider (Cloudflare, Namecheap, etc.):
   - **SPF**: TXT record on the root domain — value provided by Resend
   - **DKIM**: TXT record on subdomain `resend._domainkey.yourdomain.com` — value provided by Resend
   - **DMARC** (optional but recommended): TXT record on `_dmarc.yourdomain.com`
5. Click **Verify** in Resend dashboard — status will show `Pending` until DNS propagates
6. Check back in 1-48 hours — status changes to `Verified` when complete

**Verification:** Send a test approval email from the admin queue to your personal Gmail. It should land in inbox (not spam). Resend dashboard shows `Verified` status on the domain.

---

## Step 2: Configure Supabase Auth URLs (PROD-02)

**Must complete before real users attempt password reset or auth email clicks.**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Authentication** → **URL Configuration**
2. Set **Site URL** to: `https://contractors-connect.vercel.app`
3. Under **Additional Redirect URLs**, add: `http://localhost:3000`
   (This preserves local development auth flows — do not remove the production URL)
4. Click **Save**

**Verification:** Request a password reset email from the production site. Click the link in the email. It should open `https://contractors-connect.vercel.app/auth/update-password` — not `localhost`.

---

## Step 3: Run Migration 007 Against Production Database (PROD-03)

Migration `007_storage_policies.sql` was created in Phase 1 plan 02. It must be applied to the production Supabase project.

**Option A — Supabase CLI (preferred):**
```bash
npx supabase db push --db-url "postgresql://postgres:[password]@[project-ref].supabase.co:5432/postgres"
```
Replace `[password]` and `[project-ref]` with your Supabase project values (Settings → Database → Connection string).

**Option B — Supabase Dashboard SQL editor:**
1. Go to Supabase Dashboard → your project → **SQL Editor**
2. Copy the contents of `supabase/migrations/007_storage_policies.sql`
3. Paste and run

**Verification:**
- Upload an avatar from the profile page — should succeed
- Upload a post image — should succeed
- Attempt to upload an application document — should succeed only if path starts with your user ID

---

## Step 4: Verify Environment Variables in Vercel

All env vars should already be set (confirmed at planning time). Spot-check:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` — set
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` — set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — set
- [ ] `RESEND_API_KEY` — set
- [ ] `RESEND_FROM_EMAIL` — set (if not set, emails will use `noreply@contractorsconnect.com`)
- [ ] `NEXT_PUBLIC_ADMIN_EMAILS` — set (comma-separated admin email addresses)
- [ ] `NEXT_PUBLIC_APP_URL` — set to `https://contractors-connect.vercel.app`

Check at: Vercel Dashboard → your project → Settings → Environment Variables

---

## Step 5: Deploy Code Changes

Plans 01-01 and 01-02 added `server-only` guards and the storage migration. Push to main to trigger Vercel deployment:

```bash
git push origin main
```

Wait for Vercel build to complete (check [Vercel Dashboard](https://vercel.com/dashboard)). Build must succeed before the app is live with the new code.

---

## Phase 1 Complete — Success Criteria

- [ ] Resend domain shows `Verified` in dashboard; test approval email lands in inbox (not spam)
- [ ] Password reset email link opens `https://contractors-connect.vercel.app/auth/update-password`
- [ ] Avatar upload succeeds from `/profile` page
- [ ] Post image upload succeeds from `/explore` post composer
- [ ] `npm run build` passes locally (server-only guards in place)
