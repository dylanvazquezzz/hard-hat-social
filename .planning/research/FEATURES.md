# Feature Research

**Domain:** Verified B2B contractor directory — homepage redesign, UX polish, founding cohort onboarding
**Researched:** 2026-03-01
**Confidence:** MEDIUM — UX patterns for tradespeople are well-established; teaser profile tactics verified against marketplace research; some tradespeople-specific UX is extrapolated from broader low-digital-literacy and blue-collar worker research.

---

## Context

This research answers three specific questions for the milestone:

1. What features do high-trust B2B directory landing pages do well?
2. What UX patterns work for tradespeople (mobile-first, not tech-savvy)?
3. What makes a "teaser profile" feel credible rather than fake?

The MVP is complete. This milestone is about converting the first real visitors into applicants, presenting the directory convincingly before the founding cohort is onboarded, and polishing the core UX for users who are on phones in bright light.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels broken or amateurish.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Clear value prop above the fold | Visitors decide in 3-5 seconds whether to stay; unclear headline = instant bounce | LOW | Under 8 words for H1; "Find verified welding subs" beats "Connect with the trades community" |
| Single dominant CTA on homepage | Users need one obvious next step — confused users leave | LOW | "Apply to Join" for contractors is the right primary CTA at pre-cohort stage |
| Mobile-responsive layout with large tap targets | 83% of visits are mobile; tradespeople are on phones on job sites | LOW | Min 44px touch targets; no tiny text links |
| Loading states on data-fetching pages | Empty or frozen-looking screens read as broken, not loading | LOW | Skeleton screens (not spinners) for directory grid; structured card outlines match final layout |
| Empty state messaging on search/filter | When filters return nothing, a blank white void destroys confidence | LOW | Show "No matches for [filters] — try removing a filter" with a reset button |
| Visible trust indicators near the CTA | Users scan for proof before committing to an application | LOW | Cert badge icons, "manual verification" language, member count or "founding cohort" framing |
| Contact info clearly gated until login | Users (contractors seeking subs) need to know the payoff before registering | LOW | Show blurred/masked phone + "Sign in to view contact info" — the gate itself signals exclusivity |

### Differentiators (Competitive Advantage)

Features that set Contractors Connect apart from Angi, Thumbtack, HomeAdvisor. These are where the "verified only" moat lives.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Verified badge with credential specificity | "AWS Certified Welder" beats a generic checkmark — specificity signals real vetting, not self-reported | LOW | Show cert name + issuing body on the card, not just a badge icon; "borrowed authority beats self-proclaimed authority" |
| Teaser profiles with "Founding Member" framing | Solves chicken-and-egg without deception; frames early members as desirable, not a workaround | LOW | Use real trade data (trade, state, years experience, specialty) with name/photo obscured; "Profile pending approval" or "Founding cohort member" label is honest and intriguing |
| "Verification required" messaging as a feature, not a warning | Competitors accept anyone; your barrier IS the value proposition | LOW | Lead with "Only verified contractors" as a trust signal, not buried disclaimer; frame rejection as quality control |
| Credential-specific filter (cert type, not just trade) | Contractors looking for subs need to find someone with D1.1, not just "a welder" | MEDIUM | Requires cert data to be populated on profiles — depends on admin cert management being complete |
| Member count tied to verification status | "47 verified welders" is more compelling than "47 members" — specificity beats vagueness | LOW | Display on homepage as dynamic stat; use "verified" not just "members" |
| Application status transparency | Applicants stuck in a black box become anxious and abandon; progress visibility builds trust | LOW | "Your application is under review — typically 3-5 business days" on the confirmation screen |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Star ratings / reviews | Every directory has them; users expect them | Requires completed job verification to avoid gaming; creates a negative first impression when profiles have 0 reviews; adds significant complexity before network exists | Surface years of experience + specific certifications as quality signals instead; reviews come after the network has active jobs |
| In-app messaging | Natural progression for a network | Contact info gating already provides the incentive to join; adding messaging before the network has critical mass duplicates feature set without network benefit; high implementation cost | Keep contact info exchange off-platform; direct phone/email is faster for tradespeople anyway |
| Geolocation-based "near me" automatic filtering | Convenience feature | Mobile geolocation requires permissions users often deny; tradespeople travel for work — a Texas welder will take a Louisiana job; "near me" creates wrong mental model | Expose state filter prominently; let user choose their geography |
| AI chatbot / assistant on homepage | "Smart" feature for discovery | Adds complexity and often underperforms; tradespeople are task-oriented — they know what trade they need; the chatbot layer is for homeowners (B2C), not contractors (B2B) | Clear search filters with obvious labels; save AI assistant for when B2C layer is built |
| Social feed on landing page | Shows activity, builds community feel | Confuses the homepage value prop; "is this a social network or a directory?" hurts conversions; unread, sparse content looks dead | Keep explore/feed in logged-in area only; homepage stays focused on directory value |
| Elaborate animations / hero video | Polished, modern look | Welders on job sites have slow connections; animations increase perceived load time; video autoplaying on mobile is universally disliked | One strong hero image (real weld, real hands, real job site) beats animation; fast load > visual flair |
| User-created profile (self-reported, unverified) | Faster time-to-value | Directly destroys the differentiator; one unverified profile visible to members undermines the "verified only" promise | Application flow is the only entry point; no self-publish without admin approval |

---

## Feature Dependencies

```
[Homepage teaser profiles]
    └──requires──> [Real contractor schema + data structure]
                       └──requires──> [At least partial cert data on contractors table]

[Verified badge on profile card]
    └──requires──> [Admin cert management complete]
                       └──requires──> [certifications table populated after approval]

[Contact info gate with "Sign in to view"]
    └──requires──> [Auth working] (already complete)
    └──enhances──> [Verified member CTA on homepage]

[Founding cohort onboarding]
    └──requires──> [/apply form working] (already complete)
    └──requires──> [Admin review queue working] (already complete)
    └──requires──> [Email notifications working] (already complete)
    └──enhances──> [Teaser profiles] (teaser profiles replaced by real profiles as cohort is approved)

[Loading skeletons on /contractors]
    └──no dependencies] (pure frontend component)

[Empty state on /contractors]
    └──no dependencies] (pure frontend component)

[Mobile nav improvement]
    └──no dependencies] (layout/NavBar change only)

[SEO metadata]
    └──no dependencies] (Next.js generateMetadata, no new libraries)
```

### Dependency Notes

- **Teaser profiles require cert schema**: The most credible teaser profiles show trade + specialty + certification type. If the certifications table has no data, teasers show only trade/state/years which is weaker but still workable.
- **Verified badge requires populated certs**: The admin cert management flow (already built) must be used on at least a few profiles before badges appear meaningful. Phase ordering should put cert management completion before the homepage redesign goes live with real profiles.
- **Teaser profiles are temporary by design**: They are replaced naturally as the founding cohort is approved. Build them to degrade gracefully (show real profiles where they exist, teasers where they don't).

---

## MVP Definition for This Milestone

This milestone is "homepage redesign + UX polish + founding cohort onboarding." MVP means: what does a first-time visiting welder need to see to submit an application?

### Launch With (this milestone)

- [ ] Hero headline that states the value in one line — "Find verified welding subs. No guesswork." or equivalent
- [ ] Single CTA button above the fold — "Apply to Join" for contractors; secondary "Browse Directory" for anyone already approved
- [ ] Trust indicators in the hero — at minimum: "Manually verified credentials" + a cert badge icon + a member count
- [ ] 3-6 teaser profiles visible on homepage without login — showing trade, state, years experience, specialty; name/photo obscured; honest labeling ("Pending approval" or "Founding cohort member — more joining weekly")
- [ ] Loading skeleton on /contractors directory page
- [ ] Empty state with reset action on /contractors when filters return nothing
- [ ] Mobile nav improvement — hamburger or bottom tab bar; current nav likely collapses poorly at 375px

### Add After First Cohort Is Onboarded (v1.x)

- [ ] Dynamic member count on homepage (live count of approved contractors)
- [ ] Trade-specific landing sections — "Welders" section with specialty callouts (TIG, pipe, structural) once 10+ welders are approved
- [ ] Social proof quote — one real testimonial from a founding member, attributed with name + trade
- [ ] SEO/OpenGraph metadata per page — adds discoverability once there are real profiles worth discovering

### Future Consideration (v2+)

- [ ] Credential-specific filter (filter by AWS cert, D1.1, EPA 608) — needs cert data density to be useful
- [ ] Job board prominence on homepage — once there are active job postings
- [ ] Review/rating system — after the network has completed jobs and the trust model is proven

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Clear homepage value prop + single CTA | HIGH | LOW | P1 |
| Teaser profiles on homepage (3-6 cards) | HIGH | LOW | P1 |
| Trust indicators near CTA | HIGH | LOW | P1 |
| Loading skeletons on /contractors | MEDIUM | LOW | P1 |
| Empty state on /contractors filter | MEDIUM | LOW | P1 |
| Mobile nav improvement | HIGH | LOW | P1 |
| Verified badge with cert specificity on cards | HIGH | LOW (component; depends on data) | P1 |
| Application status transparency (post-apply screen) | MEDIUM | LOW | P1 |
| Dynamic member count | MEDIUM | LOW | P2 |
| SEO/OpenGraph metadata | MEDIUM | LOW | P2 |
| Trade-specific homepage sections | MEDIUM | MEDIUM | P2 |
| Testimonial from founding member | HIGH | LOW | P2 (needs a founding member first) |
| Toast/snackbar feedback on form actions | LOW | LOW | P2 |
| Credential-specific filter | HIGH | MEDIUM | P3 (needs cert data density) |
| Review/rating system | HIGH | HIGH | P3 (post-network) |

---

## Competitor Feature Analysis

| Feature | Angi / Thumbtack / HomeAdvisor | Our Approach |
|---------|--------------------------------|--------------|
| Profile verification | Background check (often just criminal); license may be self-reported | Manual document review by admin; cert number + issuing body shown on profile |
| Social proof on landing | Millions of contractors, star ratings, review counts | Fewer contractors, but every one is verified; frame scarcity as quality |
| Directory access | Open to anyone, often requires account | Gated by approved membership; the gate is the differentiator |
| Mobile experience | Generally adequate; Thumbtack has solid mobile app | Web-first but must be thumb-friendly; no app until web is proven |
| Lead model | Pay-per-lead (contractors hate this) | Free to contact; monetization through ads + future premium |
| Teaser/placeholder content | None — listings are real or empty | Honest teaser profiles with "founding cohort" framing to solve cold-start |

---

## Key UX Findings for Tradespeople

These translate directly to implementation decisions, not just design philosophy.

**What works for low-tech-literacy mobile users (MEDIUM confidence, sourced from UX Bulletin + Product Brain):**
- Labels over icons — "Apply" not a plus button; "Search" not a magnifying glass alone
- 2-3 navigation layers max — no nested menus; the hamburger that opens a nested submenu loses them
- Large buttons labeled with action verbs — "Apply to Join", "View Profile", "Find a Welder"
- Progressive disclosure — don't show every filter at once; start with trade + state, reveal more on tap
- Plain language error messages — "Please add your state" not "location_state is required"
- No clever copywriting — "verified welding professionals in your state" not "a curated community of credentialed tradespeople"

**What kills conversion for this audience:**
- Walls of text in the hero — they won't read it; one strong sentence only
- Forms with more than 5 fields before a payoff — multi-step application (already built) is the right pattern
- Autoplay video or animations — slow connections, bright sunlight, often muted by default
- Tiny navigation links in the top right — thumbs reach the bottom; bottom nav bar or a prominent hamburger
- Anything that looks like a tech startup — dark mode gradients, abstract illustrations; use real job site photography

**What makes a teaser profile feel credible vs fake (MEDIUM confidence, synthesized from Sharetribe + marketplace research):**
- Real data fields — show actual trade, specialty, state, years experience even when name is obscured; fabricated specialties feel wrong
- Honest labeling — "Profile pending approval" or "Founding cohort member" is honest and creates intrigue; fake names with stock photos reads as scam
- Structural consistency with real profiles — teaser cards must look identical to approved contractor cards; if the card layout changes when content loads, it signals something was hidden
- No stock photos — either use a silhouette/avatar placeholder or leave the photo empty; stock photos are immediately recognizable as fake to anyone in the trade
- Count framing — "8 verified welders + 14 applications under review" is more trustworthy than "22 members" because it acknowledges the early stage honestly
- Specificity signals authenticity — "AWS D1.1 Structural" as a specialty detail feels real; "Experienced welder" feels like placeholder copy

---

## Sources

- [Sharetribe: Chicken-and-Egg Problem in Marketplaces](https://www.sharetribe.com/marketplace-glossary/chicken-and-egg-problem/) — MEDIUM confidence
- [Ladder.io: eCommerce Marketplace Growth](https://ladder.io/blog/ecommerce-marketplace) — MEDIUM confidence
- [UX Bulletin: Designing for Low Digital Literacy Users](https://www.ux-bulletin.com/designing-low-digital-literacy-users/) — MEDIUM confidence
- [Product Brain: Design LinkedIn for Blue Collar Workers](https://theproductbrain.com/2025/09/27/design-linkedin-for-blue-collar-workers-pm-interview-question/) — LOW confidence (single source, PM interview framing)
- [LogRocket: Skeleton Loading Screen Design](https://blog.logrocket.com/ux-design/skeleton-loading-screen-design/) — HIGH confidence (implementation-specific, well-sourced)
- [Jasmine Directory: The Verified Badge — Consumer Psychology](https://www.jasminedirectory.com/blog/the-verified-badge-consumer-psychology-and-click-through-rates/) — MEDIUM confidence
- [DesignStudio UX: Mobile Navigation UX Best Practices 2026](https://www.designstudiouiux.com/blog/mobile-navigation-ux/) — MEDIUM confidence
- [AppMySite: Bottom Navigation Bar Guide 2025](https://blog.appmysite.com/bottom-navigation-bar-in-mobile-apps-heres-all-you-need-to-know/) — MEDIUM confidence
- [WebRunner Media: High-Converting Contractor Landing Page](https://webrunnermedia.com/7-elements-of-a-high-converting-contractor-landing-page/) — LOW confidence (contractor marketing firm, potential bias)
- [Instapage: B2B Landing Page Lessons 2025-2026](https://instapage.com/blog/b2b-landing-page-best-practices) — MEDIUM confidence (article referenced, full text unavailable)
- [Trade Hounds via CBInsights](https://www.cbinsights.com/company/trade-hounds) — LOW confidence (company profile, not UX research)

---

*Feature research for: Verified contractor directory — homepage redesign + UX polish + founding cohort onboarding*
*Researched: 2026-03-01*
