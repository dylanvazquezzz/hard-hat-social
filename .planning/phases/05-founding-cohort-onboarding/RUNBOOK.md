# Contractors Connect — Founding Cohort Onboarding Runbook

## 1. Overview

This document is for the co-founder of Contractors Connect. Follow it top to bottom before reaching out to any welders. By the end you will have: (1) the Vercel environment configured correctly so approval emails link to the production site, (2) verified the full application-to-approval flow works on a dummy account, and (3) copy-pasteable outreach messages ready to send. No coding required — everything here is done through the Vercel dashboard, the Contractors Connect admin panel, and your phone or group chat app.

---

## 2. Pre-Flight Checklist (Do These in Order)

Order matters. The email links read from `NEXT_PUBLIC_APP_URL` — if you set it wrong or forget to redeploy, welders will receive emails pointing to localhost (a known bug that has already affected one signup). Complete each step before moving to the next.

---

### Step 1: Set `NEXT_PUBLIC_APP_URL`

**Where:** Vercel dashboard → your project → Settings → Environment Variables

**Value:**
```
https://contractors-connect.vercel.app
```

No trailing slash. Exact spelling matters.

**Why this is first:** Every email sent by the platform (approval, rejection) reads this variable to build its links. If it is set to `localhost` or left blank, welders get emails with broken links that go nowhere. This was confirmed as a production bug on the first real signup.

**After setting it:** Go to your project's Deployments tab and trigger a redeploy (click "Redeploy" on the most recent deployment, or push any commit). The new value does not take effect until after a redeploy.

---

### Step 2: Set `NEXT_PUBLIC_CONTACT_EMAIL`

**Where:** Vercel dashboard → same Settings → Environment Variables

**Value:** Your personal email address, e.g.:
```
dylan@example.com
```

Use the email you actually check. This address appears in the invite-only banner on the `/apply` page so welders who weren't personally referred can reach you directly to request access.

**Why:** The banner is a signal of exclusivity — it tells people the platform is curated and invite-only. Without this env var set, no banner appears at all (the form still works, the banner just stays hidden).

**After setting it:** If you already redeployed in Step 1, you can deploy again now, or batch both steps and deploy once after setting both variables. Either way, a redeploy is required before the banner appears.

---

### Step 3: End-to-End Test (Before Any Real Outreach)

Run this test yourself before contacting a single welder. It takes about 10 minutes. If any step fails, stop and fix it before proceeding.

1. **Create a test account.** Go to `https://contractors-connect.vercel.app/auth` and sign up with a throwaway email address — a Gmail `+alias` (e.g. `you+test@gmail.com`) or a temporary email service like `temp-mail.org` works fine.

2. **Submit a test application.** Go to `https://contractors-connect.vercel.app/apply`. Fill in fake details — any name, any trade, any location. You do not need to upload real documents; placeholder files or screenshots work for testing purposes. Submit the form.

3. **Approve the test application.** Go to `https://contractors-connect.vercel.app/admin`. Find the test application and click "Approve."

4. **Check the approval email.** Open the inbox for the throwaway email. The approval email should arrive within a minute or two. Look at the "Sign In Now" button — hover over it or inspect the link. It must point to:
   ```
   https://contractors-connect.vercel.app/auth?redirect=/profile
   ```
   If the link contains `localhost`, stop here. Go back to Step 1 and verify `NEXT_PUBLIC_APP_URL` is set correctly and the site was redeployed after you set it.

5. **Click the button and sign in.** Click "Sign In Now" from the email. You should land on the sign-in page at the production URL. Sign in with the test account credentials.

6. **Confirm you land on `/profile`.** After signing in, you should be redirected to `https://contractors-connect.vercel.app/profile` — not `/contractors`. A welcome banner should appear at the top of the page reading: "Welcome to Contractors Connect — complete your profile to appear in the directory."

7. **Upload a profile photo.** On the Profile tab, upload any photo. After the upload completes, the welcome banner should disappear.

8. **Search the directory.** Go to `https://contractors-connect.vercel.app/contractors`. Your test contractor profile should appear in the results. If it does not appear, check that the application was approved (not still pending) in the admin panel.

**Only proceed to outreach once all 8 steps above pass without issues.**

---

## 3. Outreach Message Templates

Copy and paste these directly. Replace `[Name]` with the person's actual name in Template A.

A note on timing: welders typically need 1–3 weeks to locate and scan their documents before they can submit an application. AWS certifications, state licenses, and insurance certificates are not always in digital form. Mention this upfront so they know to gather their docs before sitting down to apply — it sets accurate expectations and reduces drop-off.

---

### Template A — Direct Text or DM (Personal Contacts)

Use this when texting or DMing someone you know personally.

```
Hey [Name], building something I think you'd want to be part of.

It's a verified welding contractor directory — kind of like LinkedIn but only for tradespeople who can prove their creds. You'd be one of the first on it.

Apply here: https://contractors-connect.vercel.app/apply

You'll need: AWS cert or equivalent, state license (if you have one), and proof of general liability insurance. Scan or photo is fine — takes about 5 minutes.

Let me know if you have questions.
```

---

### Template B — Group Chat or Trade Group Post

Use this when posting to a welding group chat, Facebook group, or trade forum.

```
Launching Contractors Connect — a verified-only directory for credentialed welders and tradespeople. No unverified accounts, no spam.

Applying is invite-only right now. If you're a certified welder with proof of insurance:
https://contractors-connect.vercel.app/apply

You'll need: AWS cert / equivalent, state license, insurance docs ready to upload.
```

---

## 4. After Each Application Arrives

When a new application appears in the admin queue at `https://contractors-connect.vercel.app/admin`:

1. **Review the documents.** Each application row includes links to the files the applicant uploaded. Open each one and verify:
   - AWS certification (or equivalent welding credential) is present and not expired
   - General liability insurance proof is present
   - State contractor license, if applicable

2. **Approve or reject.**
   - **Approve** if credentials check out — an approval email is sent automatically to the applicant with a link to sign in.
   - **Reject** if documents are missing, expired, or insufficient — a rejection email is sent automatically with instructions to reapply.

3. **Review the auto-created certification record.** After approving, go to `https://contractors-connect.vercel.app/admin/contractors/[id]` (replace `[id]` with the contractor's ID, which you can find from the admin panel). The system creates a certification record automatically from the application. If the name or issuing body needs correction — for example, if it reads "Welding Credential" but should read "AWS Certified Welder D1.1" — click the Edit button on that row to update it inline. Changes appear immediately on the contractor's public profile.

---

## 5. Notes

- **Document gathering takes time.** Expect 1–3 weeks from first outreach to completed application for most welders. This is normal — their certifications are often physical cards or PDFs buried somewhere. Plan your outreach timing accordingly.

- **Target 20–50 verified profiles.** Once the directory reaches this density, it becomes genuinely useful: a welder can find a sub in their region with the right creds without running out of results. Below 20, the directory feels empty. Focus outreach on reaching this threshold before broadening to other trades.

- **Contact info is private by default.** Phone numbers and email addresses on contractor profiles are only visible to other approved contractors who are signed in. Welders can safely post their contact info without it being scraped by the public.

- **"Is this free?"** Yes — completely free for the founding cohort, with no current plans to charge members. Ads from trade-relevant companies (tool brands, insurance, materials suppliers) are how the platform sustains itself, not member fees.

- **Follow-ups are manual.** There are no automated follow-up sequences. If a welder said they'd apply and hasn't after 2 weeks, a personal check-in message is the right move.

- **Admin access.** Only email addresses listed in the `NEXT_PUBLIC_ADMIN_EMAILS` Vercel environment variable can access `/admin`. If you need to add another admin, add their email to that comma-separated list and redeploy.
