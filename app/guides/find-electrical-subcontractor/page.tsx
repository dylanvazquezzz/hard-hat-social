import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'How to Find a Verified Electrical Subcontractor',
  description:
    'A practical guide for general contractors and project owners on finding, vetting, and hiring a qualified electrical subcontractor — state licensing requirements, insurance, code compliance, and where to find verified electricians.',
  openGraph: {
    title: 'How to Find a Verified Electrical Subcontractor | Hard Hat Social',
    description:
      'A practical guide on finding and hiring a qualified electrical subcontractor — state licensing, insurance, NEC compliance, and where to find verified electricians.',
    url: 'https://hardhatsocial.net/guides/find-electrical-subcontractor',
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What licenses does an electrical subcontractor need?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Electrical contractors are licensed at the state level — and requirements vary significantly. Most states require a licensed Electrical Contractor (EC) license for the business entity and separate individual electrician licenses (Journeyman and/or Master) for the people doing the work. Always verify both: the company\'s contractor license and the individual licenses of the electricians on your job site.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between a Journeyman and Master Electrician?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A Journeyman Electrician has completed an apprenticeship (typically 4-5 years) and passed a state exam. They can perform electrical work but usually must work under the supervision of a Master. A Master Electrician has additional experience (typically 1-2 years as a Journeyman) and has passed a more comprehensive exam. Most states require a Master Electrician to pull permits and supervise work.',
      },
    },
    {
      '@type': 'Question',
      name: 'What insurance should an electrical subcontractor carry?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'General liability at $1M per occurrence minimum, workers\' compensation for any employees, and your company named as additional insured. Electrical work has elevated fire and injury risk — many GCs require $2M aggregate GL for commercial work. Some large commercial projects also require professional liability (E&O) coverage for the design-assist work electricians sometimes perform.',
      },
    },
    {
      '@type': 'Question',
      name: 'Who is responsible for pulling electrical permits?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'In most jurisdictions, the licensed electrical contractor performing the work is responsible for pulling the electrical permit. This is not typically the GC\'s responsibility unless the GC holds their own electrical license. Clarify permit responsibility explicitly in the subcontract — do not assume.',
      },
    },
    {
      '@type': 'Question',
      name: 'Where can I find verified electrical subcontractors?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Hard Hat Social maintains a directory of manually verified electrical subcontractors — state contractor license and insurance checked before profiles go live. You can search by specialty, state, and certification type.',
      },
    },
  ],
}

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'How to Find a Verified Electrical Subcontractor',
  description:
    'A practical guide for general contractors and project owners on finding, vetting, and hiring a qualified electrical subcontractor.',
  author: {
    '@type': 'Organization',
    name: 'Hard Hat Social',
    url: 'https://hardhatsocial.net',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Hard Hat Social',
    url: 'https://hardhatsocial.net',
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': 'https://hardhatsocial.net/guides/find-electrical-subcontractor',
  },
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://hardhatsocial.net' },
    { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://hardhatsocial.net/guides' },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'How to Find a Verified Electrical Subcontractor',
      item: 'https://hardhatsocial.net/guides/find-electrical-subcontractor',
    },
  ],
}

export default function FindElectricalSubcontractorPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/guides" className="hover:text-slate-300 transition-colors">Guides</Link>
          <span>/</span>
          <span className="text-slate-400">Find an Electrical Subcontractor</span>
        </nav>

        {/* Header */}
        <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber-500">
          Guide
        </div>
        <h1 className="text-4xl font-bold leading-tight text-slate-100">
          How to Find a Verified Electrical Subcontractor
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-400">
          Electrical subcontracting has more licensing complexity than almost any other trade.
          This guide covers what licenses to verify, what insurance to require, who pulls
          permits, and where to find electricians who&apos;ve already been checked.
        </p>

        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
          <span>By Hard Hat Social</span>
          <span>·</span>
          <span>6 min read</span>
        </div>

        <hr className="my-10 border-slate-800" />

        {/* Body */}
        <div className="space-y-12 text-slate-400">

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-slate-100">
              Why electrical licensing is more complex than most trades
            </h2>
            <p className="leading-relaxed">
              Most trades have one license to check: the contractor&apos;s state license. Electrical
              work has two layers: the company license (Electrical Contractor) and the individual
              electrician licenses (Journeyman, Master) held by the people on your job site.
              Having a licensed company doesn&apos;t mean the workers are licensed — and in most
              states, unlicensed individuals performing electrical work is a code violation
              regardless of whether the company holds a license.
            </p>
            <p className="mt-4 leading-relaxed">
              Add to that the fact that electrical contractor licensing requirements vary more
              by state than almost any other trade. Some states have a single statewide license;
              others require licenses at the county or city level. A few states have limited
              reciprocity between jurisdictions; most don&apos;t.
            </p>
            <p className="mt-4 leading-relaxed">
              The upshot: &quot;licensed electrician&quot; means something different in Florida than it
              does in Texas than it does in New York. Know what you&apos;re looking for in your
              specific jurisdiction before you start evaluating subs.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-slate-100">
              Licenses and certifications to verify
            </h2>

            <div className="mt-6 space-y-5">
              <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
                <h3 className="font-semibold text-slate-100">Electrical Contractor (EC) License</h3>
                <p className="mt-2 text-sm leading-relaxed">
                  The business license authorizing the company to perform electrical work for hire.
                  Required in most states. Verify it&apos;s active and covers the project type
                  (residential vs. commercial vs. industrial — some states issue separate licenses).
                  Most state contractor license databases are searchable online.
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
                <h3 className="font-semibold text-slate-100">Master Electrician License</h3>
                <p className="mt-2 text-sm leading-relaxed">
                  The highest individual electrician license. Requires completing an apprenticeship,
                  working as a Journeyman for 1–2 years, and passing a comprehensive exam covering
                  the National Electrical Code (NEC) and local amendments. In most states, a Master
                  Electrician must be associated with the company and is responsible for pulling
                  permits and supervising work.
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
                <h3 className="font-semibold text-slate-100">Journeyman Electrician License</h3>
                <p className="mt-2 text-sm leading-relaxed">
                  Authorizes individuals to perform electrical work under the supervision of a Master.
                  Requires completing a 4–5 year apprenticeship and passing a state exam. Journeymen
                  are the boots on the ground for most electrical projects. Confirm your sub&apos;s
                  crew are licensed Journeymen — not apprentices working unsupervised.
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
                <h3 className="font-semibold text-slate-100">OSHA 10 / OSHA 30 (Safety)</h3>
                <p className="mt-2 text-sm leading-relaxed">
                  Not a licensing requirement but increasingly required on commercial job sites.
                  OSHA 10 is a basic construction safety course; OSHA 30 is the more comprehensive
                  version typically required for supervisors and foremen. Many GCs require OSHA 30
                  for any electrical foreman on site. Verify the card — OSHA training cards have
                  issue dates and are easily checked.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-slate-100">
              Insurance requirements to enforce
            </h2>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-amber-500">✓</span>
                <span>
                  <strong className="text-slate-200">General Liability — $1M per occurrence minimum.</strong>{' '}
                  Electrical work has high fire and property damage exposure. Commercial projects
                  should require $2M aggregate. Always check the policy exclusions — some cheaper
                  GL policies exclude faulty workmanship claims.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-amber-500">✓</span>
                <span>
                  <strong className="text-slate-200">Workers&apos; Compensation</strong> — electricians work in elevated-risk
                  environments: heights, energized circuits, confined spaces. WC coverage is not
                  optional for any sub with employees.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-amber-500">✓</span>
                <span>
                  <strong className="text-slate-200">Your company as additional insured</strong> — on every COI, confirmed
                  directly with the broker. Fraudulent COIs exist in the electrical trade as in
                  others.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-amber-500">✓</span>
                <span>
                  <strong className="text-slate-200">Professional Liability (E&O)</strong> — worth requiring if the electrical
                  sub is performing any design-assist work, load calculations, or specifying
                  equipment. Standard GL does not cover professional errors.
                </span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-slate-100">
              Permits: who pulls them and why it matters
            </h2>
            <p className="leading-relaxed">
              In most jurisdictions, the licensed electrical contractor performing the work is
              responsible for pulling the electrical permit — not the GC, not the owner. The
              permit holder is accountable for code compliance and must be present or represented
              during inspections.
            </p>
            <p className="mt-4 leading-relaxed">
              This matters because if an electrical sub walks off the job with an open permit,
              you can&apos;t close it without them (or their license). Make permit responsibility
              explicit in the subcontract: who pulls, who attends inspections, what happens to
              the permit if the sub is terminated.
            </p>
            <p className="mt-4 leading-relaxed">
              Red flag: a sub who says &quot;the GC handles permits.&quot; In most states, a GC cannot
              pull an electrical permit unless they hold an electrical contractor license.
              If someone is doing electrical work without a permit and it&apos;s discovered during
              a project closing or sale, it&apos;s your problem.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-slate-100">
              Red flags when evaluating an electrical sub
            </h2>
            <ul className="space-y-3">
              {[
                'Cannot produce state license numbers for both the company and the Master Electrician on record',
                'License is not verified as active in the state licensing database — licenses lapse and are not always self-reported',
                'Workers on site who are not licensed Journeymen or supervised apprentices',
                'Assumes GC handles permits — this is usually not how electrical permitting works',
                'No OSHA 30 for the foreman on a commercial project that requires it',
                'Insurance limits below what your owner contract requires — check the pass-through requirements',
                'No experience with the specific system type on your project (industrial controls, low-voltage, service entrance work)',
              ].map((flag) => (
                <li key={flag} className="flex items-start gap-3">
                  <span className="mt-0.5 text-red-400">✗</span>
                  <span>{flag}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-slate-100">
              What to include in an electrical subcontract
            </h2>
            <ul className="mt-4 space-y-2">
              {[
                'Specific scope: panels, circuits, service size, panel schedule, fixture count — no vague references to "electrical work"',
                'Applicable code edition and local amendments — NEC editions vary by jurisdiction',
                'Who pulls the electrical permit and who is responsible for inspection attendance',
                'Testing and commissioning requirements — megger tests, load bank testing, thermographic scanning where required',
                'As-built drawings and panel schedule updates upon completion',
                'Warranty on workmanship — typically 1 year on labor, with manufacturer warranties passed through on materials',
                'Schedule milestones: rough-in, above-ceiling inspection, final inspection, energization',
                'Coordination requirements with other trades — MEP coordination is the GC\'s responsibility but the sub needs to participate',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 text-amber-500">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-slate-100">
              Where to find verified electrical subcontractors
            </h2>
            <p className="leading-relaxed">
              Hard Hat Social manually reviews every electrical subcontractor&apos;s state license
              and insurance before approving their profile. You can filter by specialty, state,
              and certification type.
            </p>
            <p className="mt-4 leading-relaxed">
              Other reliable sources:
            </p>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-amber-500">·</span>
                <span>
                  <strong className="text-slate-200">IBEW (International Brotherhood of Electrical Workers)</strong> — union
                  halls can dispatch licensed Journeymen quickly. All IBEW members carry current
                  licenses as a condition of membership. Strong option for larger commercial projects
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-amber-500">·</span>
                <span>
                  <strong className="text-slate-200">NECA (National Electrical Contractors Association)</strong> — trade
                  association at necanet.org with a contractor locator. NECA contractors are
                  typically signatory union employers with strong compliance track records
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-amber-500">·</span>
                <span>
                  <strong className="text-slate-200">State licensing board databases</strong> — all states with electrical
                  contractor licensing maintain searchable online databases. Verify before you
                  hire, not after a problem surfaces
                </span>
              </li>
            </ul>

            <div className="mt-8 rounded-lg border border-amber-500/20 bg-amber-500/5 p-6 text-center">
              <p className="font-semibold text-slate-100">Find a verified electrical subcontractor now</p>
              <p className="mt-2 text-sm text-slate-400">
                Browse licensed electrical contractors and Master Electricians —
                all manually verified before profiles go live.
              </p>
              <Link
                href="/electrical-contractors"
                className="mt-5 inline-flex rounded-md bg-amber-500 px-7 py-3 font-semibold text-slate-950 hover:bg-amber-400 transition-colors"
              >
                Browse Electrical Contractors
              </Link>
            </div>
          </section>

          {/* FAQ section */}
          <section>
            <h2 className="mb-6 text-2xl font-semibold text-slate-100">
              Frequently asked questions
            </h2>
            <div className="space-y-4">
              {[
                {
                  q: 'What licenses does an electrical subcontractor need?',
                  a: 'Two layers: the company needs an Electrical Contractor (EC) license, and the individuals on site need current Journeyman or Master Electrician licenses. Both must be active in the state and jurisdiction where work is being performed. Verify both in the state licensing database — don\'t rely on self-reporting.',
                },
                {
                  q: 'What is the difference between a Journeyman and Master Electrician?',
                  a: 'A Journeyman has completed a 4-5 year apprenticeship and passed a state exam. They can perform work but typically must be supervised by a Master. A Master Electrician has additional experience and a more comprehensive license — they pull permits and are responsible for code compliance. Most states require at least one Master Electrician associated with every licensed electrical contractor company.',
                },
                {
                  q: 'What insurance should an electrical subcontractor carry?',
                  a: 'GL at $1M per occurrence minimum (commercial work often requires $2M aggregate), workers\' comp for employees, and your company as additional insured. If the sub is doing any design-assist work, also require professional liability. Check your owner contract for pass-through insurance requirements — you may be required to flow them down.',
                },
                {
                  q: 'Who is responsible for pulling electrical permits?',
                  a: 'The licensed electrical contractor performing the work, in most jurisdictions. Not the GC (unless the GC holds an electrical license). Not the owner. Make this explicit in your subcontract, including who attends inspections and what happens to the permit if the sub is terminated mid-project.',
                },
                {
                  q: 'Where can I find verified electrical subcontractors?',
                  a: 'Hard Hat Social maintains a directory of manually verified electrical subcontractors — state license and insurance checked before profiles go live. Filter by specialty and state. Also check state licensing board databases and IBEW/NECA for union contractors.',
                },
              ].map(({ q, a }) => (
                <div key={q} className="rounded-lg border border-slate-800 bg-slate-900 p-5">
                  <h3 className="font-semibold text-slate-100">{q}</h3>
                  <p className="mt-2 text-sm leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Bottom CTA */}
        <div className="mt-14 border-t border-slate-800 pt-10 text-center">
          <p className="text-slate-400">
            Need a verified electrical subcontractor?
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            <Link
              href="/electrical-contractors"
              className="rounded-md bg-amber-500 px-6 py-3 font-semibold text-slate-950 hover:bg-amber-400 transition-colors"
            >
              Browse Electricians
            </Link>
            <Link
              href="/apply"
              className="rounded-md border border-slate-600 px-6 py-3 font-semibold text-slate-200 hover:border-slate-400 transition-colors"
            >
              Apply as an Electrician
            </Link>
          </div>
        </div>

      </div>
    </>
  )
}
