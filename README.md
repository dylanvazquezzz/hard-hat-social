# Hard Hat Social

**A verified contractor directory and professional network built for the trades.**

Hard Hat Social is a high-trust platform where only credentialed, verified contractors get in — no spam, no unqualified people. It serves two audiences: contractors finding and hiring subcontractors (B2B), and homeowners/businesses finding verified pros (B2C). The B2B network comes first.

Live at **[hardhatsocial.net](https://hardhatsocial.net)**

---

## Features

- **Verified contractor profiles** — trade specialty, location, certifications, years of experience, and contact info
- **Search and filter** — by trade, state, and keyword across the full directory
- **Application + credential review** — multi-step form with document upload; admin manually approves or rejects
- **Contact info gating** — phone and email are only visible to approved, logged-in contractors
- **Certification management** — admins can add and verify individual credentials per contractor
- **Social posts feed** — members post updates, ask questions, and share availability
- **Jobs board** — subcontracting opportunity postings
- **Public profile pages** — shareable profiles at `/u/@handle`
- **Email notifications** — approval and rejection emails via Resend

---

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database + Auth | Supabase (Postgres + RLS) |
| File Storage | Supabase Storage |
| Email | Resend |
| Hosting | Vercel |

---

## Local Development

### Prerequisites

- Node.js 18+
- A Supabase project (free tier works)
- A Resend account (free tier works)

### Setup

```bash
git clone https://github.com/your-org/hardhat.git
cd hardhat
npm install
```

Copy the environment variables template and fill in your values:

```bash
cp .env.example .env.local
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `RESEND_API_KEY` | Resend API key for transactional email |
| `NEXT_PUBLIC_ADMIN_EMAILS` | Comma-separated list of admin email addresses |
| `NEXT_PUBLIC_APP_URL` | Full URL of the app (e.g. `https://hardhatsocial.net`) |

---

## Database

Migrations live in `supabase/migrations/` and are applied in order. To apply a migration against your Supabase project:

```bash
./scripts/migrate.sh supabase/migrations/001_initial.sql
```

To run an inline query:

```bash
./scripts/migrate.sh "SELECT * FROM contractors LIMIT 5;"
```

### Schema overview

- **`contractors`** — verified contractor profiles with status (`pending` | `approved` | `rejected`)
- **`certifications`** — credentials linked to a contractor, with verified flag and document URL
- **`applications`** — raw application submissions before admin review
- **`profiles`** — username and avatar for every auth user
- **`posts`** — social, Q&A, and job posts tied to a user

Row Level Security is enabled on all tables. Contact info (`phone`, `email`) is further protected by a server-side API route that only returns data to approved contractors.

---

## Deployment

The project deploys automatically to Vercel on every push to `main`. To manually deploy:

```bash
./scripts/deploy.sh "your commit message"
```

This script runs a production build check before pushing, so broken builds never reach production.

---

## Project Structure

```
app/
  page.tsx                  # Landing page
  contractors/              # Directory + individual profiles (auth-gated)
  apply/                    # Contractor application form
  explore/                  # Social + Q&A feed
  jobs/                     # Jobs/subcontracting board
  profile/                  # User dashboard (profile, posts, settings)
  u/[username]/             # Public profile pages
  admin/                    # Application review queue (admin-only)
  api/contact/[id]/         # Protected contact info endpoint
components/                 # Shared UI components
lib/
  supabase.ts               # Browser Supabase client
  supabase-admin.ts         # Server-only admin client
  types.ts                  # TypeScript types
  email.ts                  # Resend email functions
supabase/migrations/        # SQL migrations in order
scripts/
  deploy.sh                 # Build + push + Vercel deploy
  migrate.sh                # Apply SQL migrations to production
```

---

## Verification Model

Verification is **manual by design**. Contractors submit credential documents (licenses, certifications, proof of insurance) during the application flow. An admin reviews each submission and approves or rejects.

Currently focused on welding:
- AWS certification
- State contractor license
- Proof of general liability insurance
- D1.1 / D1.5 structural certifications

Other trades (HVAC, electrical, plumbing, general contractor) are defined and ready to expand into.

---

## License

Private. All rights reserved.
