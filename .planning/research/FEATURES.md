# Feature Research

**Domain:** Verified B2B contractor directory — feed redesign, jobs lifecycle tracking, mutual ratings, verified portfolio
**Researched:** 2026-03-04
**Confidence:** MEDIUM — Jobs/ratings design patterns are well-established from marketplace research (Airbnb, Upwork); feed sidebar patterns sourced from LinkedIn/Twitter/product research; contractor-specific UX extrapolated from broader trades + marketplace knowledge.

---

## Context

This research answers four specific questions for the v1.2 milestone:

1. What does a professional social feed with a discovery sidebar look like? What are table stakes vs. differentiators?
2. What are the expected states and behaviors of a platform-tracked jobs system (GC → Sub flow)?
3. How do mutual rating systems work, and what design choices prevent gaming and retaliation?
4. What does a "verified past jobs portfolio" section on a contractor profile need to contain?

The existing MVP is complete (profiles, search, application, admin queue, contact gating, posts, explore, jobs board, user dashboard, public profiles, auth nav). This milestone adds jobs completion tracking, mutual ratings, and a feed/sidebar redesign on top of that foundation.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist once you describe the product. Missing these = the feature feels half-built.

#### Feed Redesign

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Full-width post cards in feed | Industry standard since Twitter/LinkedIn normalized it; narrow cards feel cramped and suggest mobile-after-thought | LOW | Posts should fill the content column minus padding; sidebar sits alongside, not nested inside the feed |
| Right sidebar for discovery/suggestions | LinkedIn, Twitter/X, Product Hunt, Quora all place "people you may know" / "suggested connections" in the right column; users scan right for secondary content | LOW | Sidebar should be sticky (scrolls with user to some point); contents: suggested contractors to follow, active jobs in their trade, recent verified members |
| Feed filtering / tab switching | Users expect to switch between All / Social / Q&A / Jobs without leaving the page | LOW | Already exists in explore; redesign just needs to keep this and present it cleanly at the top of the feed column |
| Empty states per filter | "No Q&A posts yet — be the first to ask" is expected; blank white space reads as broken | LOW | Each feed tab needs its own empty state with a CTA (ask a question, post an update, view jobs) |
| Post composer accessible from feed | Users expect to create content from the feed, not navigate to a separate page | LOW | "What's happening on your job site?" input at top of feed, or a prominent "+ Post" button |
| Post images rendering cleanly | Images in posts should render in-line, not as file attachments | LOW | Already built in PostCard; ensure image aspect ratio is constrained (16:9 or square) so posts don't vary wildly in height |

#### Jobs Lifecycle

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Clear job status visible to both parties | Both GC and sub need to know where a job stands without emailing each other | LOW | Status pill on job card: "Open", "Hired", "In Progress", "Completed", "Rated" |
| GC can mark a sub as hired | The core action of the system; GC selected from applicants or direct contact | LOW | Button on job posting for GC: "Mark as Hired" → select which contractor |
| GC can mark job as complete | Triggers the rating unlock; GC confirms work is done | LOW | Button appears once hired; "Mark Complete" — leads to rating prompt |
| Both parties see job in their history | GC and sub both need job in their activity/history once hired | MEDIUM | jobs table needs contractor_id (sub) + poster_id (GC); both users see it in their dashboard |
| Rating prompt appears after completion | Users expect the rating prompt to appear naturally, not require hunting for it | LOW | After "Mark Complete", both parties see a prompt to rate each other; notification + UI prompt |
| Rating window expiry | Rating prompt doesn't stay open forever; users expect a deadline (14 days is the Airbnb standard) | LOW | After 14 days, rating opportunity closes; job moves to "Completed (unrated)" state |

#### Mutual Ratings

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Star rating (1–5) | Universal; users expect a numeric scale | LOW | 5-star scale is the standard; half-stars optional, probably not worth complexity here |
| Short written review (optional text) | A score alone is not meaningful; a one-sentence summary is expected | LOW | Text field: optional, 280 char limit; displayed on profile |
| Rating visible on profile after both submit | Both parties expect their rating to appear on their public profile | MEDIUM | Only display after both parties have rated OR the window expires — simultaneous reveal prevents retaliation |
| Average rating displayed on profile | Single number summary users can scan quickly | LOW | "4.8 (12 ratings)" format; show both overall average and number of ratings |
| Ratings tied to completed platform jobs | Rating system should only accept ratings from platform-tracked completed jobs | HIGH | This is the core trust guarantee; no ratings without a completed job record |

#### Past Jobs Portfolio

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| "Verified Jobs" section on contractor profile | Once jobs exist, a sub's profile needs to show completed work — this is the portfolio section | MEDIUM | Section on /u/[username] and /contractors/[id] showing completed platform-tracked jobs |
| Job title + GC name visible | The sub's clients are trust signals; showing who hired you is the proof | LOW | "Structural welding — hired by [GC Company Name]" as the job entry format |
| Completion date | Recency matters; a job from 3 years ago is less compelling than last month | LOW | Month + year is enough; exact dates not necessary |
| Rating received visible on portfolio entry | Each job entry should show the rating the sub received for that job | LOW | Star display next to the job entry; ties back to the rating system |
| Portfolio only shows platform-verified jobs | Self-reported past work is not shown here; this section is earned, not filled in | HIGH | The "verified" badge on portfolio items is the differentiator; don't allow manual addition |

---

### Differentiators (Competitive Advantage)

Features that set Hard Hat Social apart from LinkedIn, Angi, Thumbtack, or a generic jobs board.

#### Feed Redesign

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Sidebar suggestions filtered by trade | "People in welding you might know" is more useful than generic people suggestions — LinkedIn does same-trade suggestions well | MEDIUM | Filter suggested people by the logged-in contractor's primary trade; sort by mutual connections or same state |
| "Recently verified" sidebar widget | Shows newly approved contractors — creates a social pulse, surfaces new members to follow | LOW | Query contractors table for status='approved', order by created_at DESC, limit 5; no algorithm needed |
| Active jobs in the sidebar | Subcontractors looking for work see open jobs without navigating away from the feed | LOW | Pull 3-5 open job postings from jobs table; link to /jobs for full list |
| Trade-specific feed (default to your trade) | A welder's feed defaults to welding content; a plumber sees plumbing content | MEDIUM | Requires user trade stored on profile; filter posts where contractor trade matches; allow "All Trades" toggle |

#### Jobs Lifecycle

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Simultaneous rating reveal (Airbnb model) | Prevents retaliation and gaming; both parties rate without seeing the other's rating first; research shows 31% reduction in retaliatory 1-star ratings when simultaneous | MEDIUM | Store ratings in DB without exposing them until both submit or window expires; server-side logic to check reveal condition |
| Job completion as the rating gate | Ratings only exist for platform-verified completed work — this is the moat vs Angi/Thumbtack where ratings are unverified | HIGH | Rating table FK to completed job record; no job record = no rating possible |
| Portfolio auto-populated from completed jobs | Sub's past jobs appear automatically — no manual entry, no fabrication possible | MEDIUM | On job completion, a portfolio entry is created; the sub cannot edit title/GC/date — only description |

#### Mutual Ratings

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| GCs rated too (not just subs) | GCs on other platforms are unaccountable; subs on Hard Hat Social know if a GC pays on time, communicates well, treats workers fairly | MEDIUM | Bidirectional rating; GC profiles show their rating as a GC (payer, communicator, safety) |
| Rating categories (not just overall) | "Communication: 5, Timeliness: 4, Quality: 5" is more useful than a single number | MEDIUM | 3 categories per side: Sub rates GC on Payment Timeliness + Communication + Safety; GC rates Sub on Quality + Timeliness + Professionalism |
| Rating summary on public profile | "4.8 quality, 4.7 timeliness, 4.9 professionalism (14 jobs)" is a compelling trust signal | LOW | Aggregate per category on profile; display as a mini scorecard, not a wall of reviews |

#### Past Jobs Portfolio

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| "Platform-verified" badge on portfolio entries | Distinguishes verified completed work from anything self-reported; the verification chain is: GC marked complete → admin didn't dispute → rating unlocked | LOW | Badge/icon on each portfolio entry: "Completed via Hard Hat Social" — lean on Supabase RLS to prevent manual DB writes |
| GC's rating of the sub shown inline | Portfolio entry shows what the GC said about this sub's work — proof of quality | LOW | Display GC's written review (if any) and star rating beneath each portfolio entry |
| Optional photo/description from sub | Sub can add a short note about the work ("Structural welding on commercial build, 12 weeks") + one photo | MEDIUM | Text: 280 chars; image: optional, upload to Supabase Storage; GC/date/title cannot be edited |

---

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Self-reported past jobs | Contractors want to show all their work history, not just platform jobs | Destroys the verified portfolio moat; if any entry can be fabricated, none are credible | Keep the portfolio section strictly platform-verified; add a separate "Work History" free-text field on the profile where contractors can describe past experience without it appearing as verified |
| Dispute / resolution system on jobs | "What if the GC marks complete but work isn't done?" | Full dispute system (escrow, mediation, chargebacks) is a massive scope expansion; no payment is involved, so the stakes are lower | Allow either party to flag a job for admin review; admin can revert completion status; keep it a human decision, not an automated workflow |
| Public rating before both parties submit | "Show my rating as soon as I rate" | Sequential reveal enables retaliation — if GC sees sub gave 3 stars, GC retaliates with 1 star; Airbnb research shows 31% reduction in retaliatory ratings with simultaneous reveal | Simultaneous reveal: show a "Waiting for other party to rate" state; both ratings publish together after both submit or window closes |
| Rating without job completion | "Let me rate contractors I've worked with off-platform" | Undermines the verified-jobs moat entirely; off-platform ratings have no verifiability | Keep ratings strictly gated behind platform-tracked job completion; market it as a feature ("only verified completed jobs") |
| Infinite scroll in the sidebar | Shows more content, keeps users on page | Sidebars are scannable secondary content; infinite scroll makes them compete with the main feed; users stop reading sidebars that behave like feeds | Hard limit of 5-7 items per sidebar widget; "See all" link to the full page |
| Follower/following counts prominently on profile | Social proof metric | Trades is not an influencer game; a welder with 3 followers but 15 verified completed jobs is more valuable than one with 500 followers; follower count gamification hurts quality signal | Prioritize verified jobs count and rating average as the primary profile metrics; follower count can be a secondary display |
| Rating on the first day after completion | "Get rating out faster" | Workers need time to assess payment timeliness (did the GC pay?) before rating; immediate ratings skew toward recency bias (good mood = 5 stars, forgetting the late payment) | Open rating window after 24-48 hour buffer post-completion; closes at 14 days |
| AI-generated sidebar suggestions | "Smarter recommendations" | Complexity and maintenance far exceed benefit at this stage; small network (<500 users) means recommendation algorithms have too little signal to be useful | Simple rule-based suggestions: same trade, same state, recently joined; revisit AI suggestions after 1,000+ users |

---

## Feature Dependencies

```
[Mutual ratings system]
    └──requires──> [Jobs lifecycle: "Mark Complete" status]
                       └──requires──> [Jobs lifecycle: "Mark Hired" status]
                                          └──requires──> [Existing jobs board with job postings]

[Past jobs portfolio on profile]
    └──requires──> [Jobs lifecycle: "Mark Complete" status]
    └──requires──> [Rating system (to show rating received per job)]
    └──enhances──> [Public contractor profile /u/[username]]

[Simultaneous rating reveal]
    └──requires──> [Both parties have submitted a rating OR window has expired]
    └──requires──> [14-day expiry timer on each completed job]

[Trade-filtered feed]
    └──requires──> [Contractor trade stored on profiles table (or contractor_id linkage)]

[Sidebar: "Recently verified" widget]
    └──requires──> [contractors table with status='approved' + created_at]
    └──no new schema required]

[Sidebar: "Suggested people" widget]
    └──requires──> [profiles table + contractor trade]
    └──no new schema required (query-only)]

[Sidebar: "Active jobs" widget]
    └──requires──> [Existing posts/jobs table]
    └──no new schema required]

[GC rating of sub shown on portfolio]
    └──requires──> [Rating submitted by GC for that job]
    └──requires──> [Simultaneous reveal condition met]
```

### Dependency Notes

- **Jobs lifecycle is the foundation of this milestone.** Ratings and portfolio both require a completed job record. Build the jobs state machine (open → hired → in progress → complete) before ratings or portfolio.
- **Ratings require the reveal condition logic.** The hardest part of mutual ratings is not the form — it's the reveal logic. Both parties must have rated, OR the 14-day window must have expired, before either rating is visible. This is a server-side check, not frontend state.
- **Portfolio is read-only from the user's perspective for core fields.** The sub can add a description and photo, but job title, GC name, completion date, and the received rating are all system-written. This protects the verified claim.
- **Feed sidebar widgets are query-only additions.** None of the three sidebar widgets (recently verified, suggested people, active jobs) require schema changes — they query existing tables. This makes the sidebar implementation lower-risk than the jobs/ratings work.
- **Feed redesign layout change is independent.** Moving from the current layout to full-width posts + right sidebar is a CSS/layout change to the explore page. It does not depend on jobs or ratings. Ship it first.

---

## MVP Definition for This Milestone

### Launch With (v1.2 core)

The minimum that makes this milestone meaningful — each feature must be complete enough to be usable, not just present.

- [ ] **Feed layout: full-width posts + right sidebar** — layout change to /explore; sidebar shows at minimum "Recently Verified" and "Suggested People (same trade)" widgets; active jobs widget can follow
- [ ] **Jobs state machine: open → hired → complete** — GC can mark a hired sub on a job posting; GC can mark the job complete; status is visible to both parties on the job card
- [ ] **Rating prompt after job completion** — both GC and sub see a prompt to rate after GC marks complete; 5-star scale + optional 280-char text; simultaneous reveal (neither sees the other's rating until both submit or 14 days pass)
- [ ] **Rating displayed on profiles** — once revealed, GC rating appears on sub's profile and sub rating appears on GC's profile; average rating + count displayed
- [ ] **Past jobs portfolio section on contractor profile** — section on /u/[username] showing completed platform jobs: job title, GC name, completion date, rating received; system-written, not user-editable for core fields

### Add After v1.2 Ships (v1.2.x)

- [ ] **Rating categories (Quality, Timeliness, Professionalism for subs; Payment, Communication, Safety for GCs)** — adds nuance without blocking the core rating launch
- [ ] **Trade-specific feed default** — default explore feed to user's primary trade; "All Trades" toggle; requires contractor trade surfaced on profiles
- [ ] **Portfolio: sub-added description + photo** — sub can annotate their portfolio entry with a short note and one image; core job facts remain system-written
- [ ] **Active jobs sidebar widget** — third sidebar widget showing open job postings in the user's trade; lower priority than recently-verified and suggested-people

### Future Consideration (v2+)

- [ ] **GC profile rating scorecard** — GCs being rated is differentiating but adds complexity to the profile display; build after ratings data exists to display
- [ ] **Admin dispute review on job completion** — flag for admin if a party disputes the completion status; keep it manual for now, automate later
- [ ] **AI-based sidebar suggestions** — rule-based is sufficient at <500 users; revisit at 1,000+ with enough signal for algorithmic recommendations

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Feed layout: full-width + right sidebar | HIGH | LOW | P1 |
| Sidebar: recently verified members widget | MEDIUM | LOW | P1 |
| Sidebar: suggested people (same trade) widget | HIGH | LOW | P1 |
| Jobs: mark hired | HIGH | MEDIUM | P1 |
| Jobs: mark complete | HIGH | LOW | P1 |
| Rating prompt after completion | HIGH | MEDIUM | P1 |
| Simultaneous rating reveal logic | HIGH | MEDIUM | P1 |
| Rating on contractor profile (average + count) | HIGH | LOW | P1 |
| Past jobs portfolio on profile | HIGH | MEDIUM | P1 |
| Rating categories (sub-dimensions) | MEDIUM | MEDIUM | P2 |
| Trade-filtered feed | MEDIUM | LOW | P2 |
| Portfolio: sub description + photo | MEDIUM | LOW | P2 |
| Active jobs sidebar widget | LOW | LOW | P2 |
| GC profile rating scorecard | MEDIUM | MEDIUM | P2 |
| Admin dispute review flow | LOW | MEDIUM | P3 |
| AI sidebar recommendations | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for v1.2 to be meaningful
- P2: Should have, add when P1 is working
- P3: Future consideration

---

## Competitor Feature Analysis

| Feature | LinkedIn | Upwork | Angi / Thumbtack | Hard Hat Social Approach |
|---------|----------|--------|-------------------|--------------------------|
| Social feed layout | Full-width posts, right sidebar for ads + suggestions | Not a social feed; job listing focus | No feed | Full-width posts, right sidebar for verified member discovery — no ads |
| Suggested connections sidebar | "People You May Know" — based on industry, shared connections, employer history | N/A | N/A | Same-trade, same-state suggestions; simple rule-based; recently verified members |
| Job lifecycle tracking | Job applications tracked but no "hired" / "complete" confirmation | Detailed: contract → milestones → payment → feedback | Job request → quote → hire — no platform confirmation of completion | Open → Hired → In Progress → Complete → Rated; completion is the rating gate |
| Rating system | Skill endorsements (unverified); recommendations (one-directional) | Bidirectional; Job Success Score for freelancers; client rated too | Ratings on contractors only; not mutual; not tied to platform-verified work | Mutual (GC ↔ sub); simultaneous reveal; locked behind platform-tracked job completion |
| Past jobs portfolio | Work experience (self-reported) | Portfolio (self-uploaded, unverified) | Project photos (self-uploaded) | Platform-verified only; auto-generated from completed jobs; cannot be fabricated |
| Rating reveal | Immediate (recommendations are one-way so no reveal issue) | Sequential — freelancer sees client feedback first, then responds | Immediate | Simultaneous — neither party sees the other's rating until both submit or 14 days expire |

---

## Key Design Decisions with Rationale

### Simultaneous Reveal for Ratings

Airbnb switched to simultaneous reveal and found a 31% reduction in retaliatory 1-star ratings and 12-17% more honest negative text included in reviews. The mechanism: neither party sees the other's rating until both have submitted OR the 14-day window closes. This produces more honest feedback and more useful data.

**Implementation implication:** Ratings must be stored in a DB row that is not readable by either party until the reveal condition is met. A server-side check (both_submitted OR expired_at < now()) gates visibility. This is not a frontend concern — it must be enforced at the API/RLS level.

Confidence: HIGH — sourced from academic research (Fradkin et al.) and Airbnb's own published policy rationale.

### Rating Window: 14 Days

14 days is the Airbnb standard and gives both parties time to assess outcomes that aren't immediately obvious (e.g., "did the GC pay?" can take a few days). A 24-48 hour buffer before the window opens prevents immediate emotional ratings.

Confidence: MEDIUM — Airbnb uses 14 days; other platforms vary (Upwork gives 14 days post-contract close); no single authoritative standard but convergence at 14 days is strong.

### Feed Sidebar: Rule-Based, Not Algorithmic

At network scale <500 users, recommendation algorithms have too little signal to produce good results. Rule-based suggestions (same trade + same state, recently approved) are more predictable and faster to build. "Recently Verified" is the highest-value widget because it creates a social pulse — seeing new verified members appear builds confidence in the platform's growth.

Confidence: MEDIUM — based on standard platform growth wisdom; early-stage recommendation systems are a known waste of engineering time before data density exists.

### Portfolio: Read-Only Core Fields

The "verified" claim on portfolio entries is only valuable if it cannot be gamed. System-written fields (job title, GC name, completion date, rating received) must be immutable from the user's side. RLS policies should prevent direct writes to these columns from the client. The sub's optional description and photo are additive — they enhance but don't override the system record.

Confidence: HIGH — fundamental to the trust model; backed by how every verified credential system (Upwork's "Top Rated" badge, AWS certification, Airbnb's verified stay) protects its authoritative data from user edits.

---

## Sources

- [Airbnb simultaneous review reveal research — Fradkin, Grewal, Holtz, Pearson (NBER)](https://conference.nber.org/confer/2015/SI2015/PRIT/Fradkin_Grewal_Holtz_Pearson.pdf) — HIGH confidence
- [VentureBeat: Airbnb tweaks review system to prevent retaliation](https://venturebeat.com/business/airbnb-tweaks-review-system-so-guests-dont-fear-retaliation-from-hosts) — HIGH confidence
- [ResearchGate: Tit for Tat? The Difficulty of Designing Two-Sided Reputation Systems](https://www.researchgate.net/publication/346961659_Tit_for_Tat_The_Difficulty_of_Designing_Two-Sided_Reputation_Systems) — HIGH confidence
- [Medium: Economics and Design of Rating Systems in Digital Platforms](https://medium.com/the-discovery-imperative/the-economics-and-design-of-rating-systems-in-digital-platforms-01922e57b48b) — MEDIUM confidence
- [LinkedIn on Inflated Positivity in Two-Way Review Systems](https://www.linkedin.com/pulse/two-way-rating-system-skewing-results-larissa-dundon) — MEDIUM confidence
- [GetStream: Social Media Feed Design Patterns](https://getstream.io/blog/social-media-feed/) — MEDIUM confidence
- [Hootsuite: How the LinkedIn Algorithm Works 2025](https://blog.hootsuite.com/linkedin-algorithm/) — HIGH confidence
- [Kathryn Gorges: LinkedIn Suggested Connections Criteria](https://www.kathryngorges.com/who-are-those-people-you-may-know-in-linkedins-suggested-connections/) — MEDIUM confidence
- [Airbnb Review Policy (official)](https://www.airbnb.com/help/article/2673) — HIGH confidence
- [TaskTag: Contractor Portfolio Guide 2026](https://portal.tasktag.com/blog/contractor-portfolio) — LOW confidence (single source, contractor marketing context)
- [Upwork: Job Success Score](https://support.upwork.com/hc/en-us/articles/211068358-All-about-your-Job-Success-Score) — HIGH confidence

---

*Feature research for: Hard Hat Social — feed redesign, jobs lifecycle, mutual ratings, verified portfolio*
*Researched: 2026-03-04*
