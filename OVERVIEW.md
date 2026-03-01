# Contractors Connect — Build Overview
*February 2026*

---

## What We're Building

Contractors Connect is a verified contractor directory and professional network built for the trades. The core idea: only credentialed, verified contractors get in. No spam, no unqualified people, no race to the bottom on price. Think LinkedIn meets a trade union hall — but actually useful.

**Two use cases, one platform:**
- Contractors finding and hiring subcontractors (B2B)
- Homeowners and businesses finding verified pros (B2C)

We're leading with B2B. Build the trusted network first, then open it to consumers once the quality floor is established.

---

## Where We Are

### MVP — Complete ✅

Everything needed to get real contractors on the platform and generating value is built and live.

| Feature | Status |
|---|---|
| Contractor profiles (trade, location, certs, experience, contact) | ✅ Live |
| Search + filter by trade, state, and keyword | ✅ Live |
| Contractor application form with credential document upload | ✅ Live |
| Admin review queue — approve or reject applicants | ✅ Live |
| Contact info gating — phone/email visible to verified members only | ✅ Live |
| Approval/rejection email notifications | ✅ Live |
| Password reset flow | ✅ Live |
| Admin certification management — add/remove verified certs per contractor | ✅ Live |

### Beyond MVP — Also Built

We went further than the original scope because the features were small lifts that add real value to the network:

| Feature | Status |
|---|---|
| Social posts feed (updates, availability, Q&A) | ✅ Live |
| Jobs board — subcontracting opportunity postings | ✅ Live |
| User profile dashboard — avatar, bio, post composer, account settings | ✅ Live |
| Public profile pages at `/u/@handle` | ✅ Live |
| Auth-aware navigation | ✅ Live |

### Infrastructure

| Item | Status |
|---|---|
| Deployed to production (Vercel) | ✅ Done |
| Database with Row Level Security | ✅ Done |
| File storage for avatars, posts, and credential docs | ✅ Done |
| 6 database migrations in version control | ✅ Done |
| GitHub repository | ✅ Done |

---

## What's Next

These are the remaining items before we start onboarding the founding cohort:

1. **Seed the founding cohort** — Run the first real welders through the application → approval → certification flow
2. **Email domain verification** — Need a domain (e.g. contractorsconnect.com) to send approval emails from a branded address instead of a placeholder
3. **SEO / metadata** — OpenGraph tags so links shared on text/social look good
4. **Homepage polish** — Tighten the landing page copy and CTAs once real contractor count can be cited

---

## How the Platform Works (End to End)

1. A contractor finds the site, reads the homepage, clicks "Apply"
2. They fill out a multi-step form: name, trade, location, experience, bio, specialties, and upload credential documents (license, cert, insurance)
3. Submission lands in the admin queue
4. Admin reviews documents, approves or rejects — contractor gets an email either way
5. Approved contractor logs in, sets up their profile, starts posting
6. Other approved contractors can search the directory, find them, and view their contact info
7. Homeowners and businesses can browse profiles — but need to sign up to see contact details

---

## Tool Definitions

A plain-English breakdown of the technology powering this platform and why each piece exists.

---

### Supabase
**What it is:** A hosted database and authentication platform. Think of it as the backend brain of the app — it stores all the data and handles who can see what.

**What it does for Contractors Connect:**
- Stores every contractor profile, certification, application, post, and user account
- Handles login, signup, password reset, and session management
- Enforces access rules at the database level — for example, contact info (phone/email) is locked behind a rule that only lets approved contractors see it, regardless of how someone tries to access it
- Stores uploaded files: credential documents, profile photos, post images

**Why it matters:** We don't run our own servers or manage our own database infrastructure. Supabase handles that so we can move fast and keep costs near zero at early scale.

---

### Vercel
**What it is:** A hosting platform purpose-built for Next.js apps. It's where the website lives and runs.

**What it does for Contractors Connect:**
- Hosts the production website at contractors-connect.vercel.app (custom domain later)
- Automatically redeploys every time code is pushed to GitHub — no manual deployments
- Runs the server-side code (search queries, admin actions, contact info protection) close to users for speed
- Manages environment variables (API keys, database credentials) securely

**Why it matters:** Zero-config deployment. Push code, site updates. No DevOps overhead.

---

### Git + GitHub
**What it is:** Git is version control — it tracks every change ever made to the codebase. GitHub is where that history lives in the cloud.

**What it does for Contractors Connect:**
- Every feature built is committed with a description of what changed and why
- Full history of the codebase from day one — nothing is ever lost
- Acts as the bridge to Vercel: when code is pushed to GitHub, Vercel automatically picks it up and deploys

**Why it matters:** Standard professional practice. Enables collaboration, rollback if something breaks, and a clean audit trail of every decision made during the build.

---

### Resend
**What it is:** A developer-focused email delivery service.

**What it does for Contractors Connect:**
- Sends approval emails to contractors when their application is accepted — includes a welcome message and next steps
- Sends rejection emails when an application doesn't meet requirements
- Will handle any future transactional emails (password resets, notifications)

**Why it matters:** Email deliverability is harder than it looks — spam filters are aggressive. Resend handles the infrastructure so our emails actually land in inboxes. Currently using a placeholder sender address; once we have a domain (contractorsconnect.com or similar) we'll verify it with Resend and send from a branded address.

---

### Homebrew
**What it is:** A package manager for macOS. It installs developer tools from the command line.

**What it does for Contractors Connect:**
- Used to install tools needed during development (e.g. the GitHub CLI)
- Not part of the production stack — purely a local development convenience

**Why it matters:** Mentioned here for completeness. Has no impact on the live product.

---

## Success Metrics for the Founding Cohort

- 20–50 verified welding contractors with complete profiles
- At least one contractor-to-subcontractor connection made through the platform
- Application → approval flow runs without admin intervention beyond the review itself
- Zero unverified contractors in the directory

---

## The Moat

The verification requirement is the product. Anyone can build a contractor directory. Very few are willing to do the manual credential review that keeps unqualified people out. That friction is the entire value proposition — it's what makes the network worth joining and worth trusting.

The founding cohort of real, known welders sets the quality standard. Every contractor who joins after them is joining a network that already has a reputation.
