import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'How to Find a Verified HVAC Subcontractor',
  description:
    'A practical guide for general contractors and project owners on finding, vetting, and hiring a qualified HVAC subcontractor — EPA 608 certification, state licensing, insurance requirements, and where to find verified HVAC techs.',
  openGraph: {
    title: 'How to Find a Verified HVAC Subcontractor | Hard Hat Social',
    description:
      'A practical guide on finding and hiring a qualified HVAC subcontractor — EPA 608, state licensing, insurance requirements, and where to find verified HVAC technicians.',
    url: 'https://hardhatsocial.net/guides/find-hvac-subcontractor',
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What certifications should an HVAC subcontractor have?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'At minimum: EPA Section 608 certification (federal law for anyone handling refrigerants), a current state HVAC contractor license, and proof of general liability insurance. For commercial work, a Type II or Universal EPA 608 certificate is standard. Many states also require a specific HVAC or mechanical contractor license separate from a general contractor license.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is EPA 608 certification required for HVAC subcontractors?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Federal law under Section 608 of the Clean Air Act requires anyone who purchases or handles refrigerants to be EPA 608 certified. There is no exemption for subcontractors. Hiring an uncertified tech and having them handle refrigerants exposes your company to federal fines — not just the subcontractor.',
      },
    },
    {
      '@type': 'Question',
      name: 'What does an HVAC state contractor license cover?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'State HVAC licenses govern who can legally install, modify, or service HVAC systems in that state. Requirements vary significantly — some states require a dedicated HVAC license, others accept a mechanical contractor license, and a few states have no statewide requirement but defer to local jurisdictions. Always verify the sub has the correct license for the specific state and municipality your project is in.',
      },
    },
    {
      '@type': 'Question',
      name: 'What insurance should an HVAC subcontractor carry?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'General liability at $1M per occurrence minimum, workers\' compensation if the sub has employees, and your company named as additional insured on the COI. For commercial HVAC work, many project owners require $2M aggregate on GL. HVAC work involving refrigerants or gas lines also benefits from a pollution liability endorsement.',
      },
    },
    {
      '@type': 'Question',
      name: 'Where can I find verified HVAC subcontractors?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Hard Hat Social maintains a directory of manually verified HVAC subcontractors — every tech is checked for EPA 608 certification, state license, and insurance before their profile goes live. You can search by specialty, state, and certification type.',
      },
    },
  ],
}

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'How to Find a Verified HVAC Subcontractor',
  description:
    'A practical guide for general contractors and project owners on finding, vetting, and hiring a qualified HVAC subcontractor.',
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
    '@id': 'https://hardhatsocial.net/guides/find-hvac-subcontractor',
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
      name: 'How to Find a Verified HVAC Subcontractor',
      item: 'https://hardhatsocial.net/guides/find-hvac-subcontractor',
    },
  ],
}

export default function FindHvacSubcontractorPage() {
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
          <span className="text-slate-400">Find an HVAC Subcontractor</span>
        </nav>

        {/* Header */}
        <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber-500">
          Guide
        </div>
        <h1 className="text-4xl font-bold leading-tight text-slate-100">
          How to Find a Verified HVAC Subcontractor
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-400">
          HVAC subcontractors operate under federal and state licensing requirements that most
          GCs don&apos;t fully know. This guide covers what to check, what to require, and
          where to find HVAC techs who&apos;ve already been vetted.
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
              The hidden compliance risk in HVAC subcontracting
            </h2>
            <p className="leading-relaxed">
              Most GCs know to ask for a license and insurance. HVAC adds a federal layer most
              people overlook: EPA Section 608 certification. This is a federal requirement
              under the Clean Air Act — anyone who purchases or handles refrigerants must be
              certified. That means your subcontractor, not just their company, needs a current
              EPA 608 card.
            </p>
            <p className="mt-4 leading-relaxed">
              If your sub handles refrigerants without EPA 608 certification and it comes up
              during an inspection or a claim, you&apos;re not insulated just because you hired
              them as a sub. Federal enforcement can reach up the chain. This isn&apos;t a
              theoretical risk — EPA fines for Section 608 violations run up to $44,539 per day
              per violation.
            </p>
            <p className="mt-4 leading-relaxed">
              The good news: verifying it takes 30 seconds. Ask for the card, check the certification
              type and expiration date, move on.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-slate-100">
              Certifications and licenses that matter
            </h2>

            <div className="mt-6 space-y-5">
              <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
                <h3 className="font-semibold text-slate-100">EPA Section 608 Certification</h3>
                <p className="mt-2 text-sm leading-relaxed">
                  Issued by the{' '}
                  <a href="https://www.epa.gov/section608" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">
                    U.S. Environmental Protection Agency
                  </a>
                  , Section 608 certifies technicians to handle refrigerants. There are four types:
                </p>
                <ul className="mt-3 space-y-1 text-sm">
                  <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">·</span><span><strong className="text-slate-200">Type I</strong> — small appliances (refrigerators, window AC units)</span></li>
                  <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">·</span><span><strong className="text-slate-200">Type II</strong> — high-pressure systems (commercial AC, split systems)</span></li>
                  <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">·</span><span><strong className="text-slate-200">Type III</strong> — low-pressure systems (centrifugal chillers)</span></li>
                  <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">·</span><span><strong className="text-slate-200">Universal</strong> — covers all three types; required for most commercial work</span></li>
                </ul>
                <p className="mt-3 text-sm leading-relaxed">
                  EPA 608 certifications do not expire, but always confirm the certificate was obtained
                  through an EPA-approved certifying organization. There is no federal registry to look up
                  certifications — you must see the physical card or a scanned copy.
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
                <h3 className="font-semibold text-slate-100">State HVAC / Mechanical Contractor License</h3>
                <p className="mt-2 text-sm leading-relaxed">
                  Licensing requirements vary significantly by state. Some states (Florida, Texas,
                  California) have robust statewide HVAC licensing. Others defer to county or city
                  jurisdictions — meaning a licensed contractor in one city may not be licensed in
                  the city across the county line. Always verify the sub is licensed for the specific
                  jurisdiction your project is in, not just &quot;licensed in the state.&quot;
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
                <h3 className="font-semibold text-slate-100">NATE Certification (North American Technician Excellence)</h3>
                <p className="mt-2 text-sm leading-relaxed">
                  Not legally required, but NATE certification is an industry quality signal.
                  NATE-certified technicians have passed independent competency exams in specific
                  HVAC specialties. If you&apos;re comparing two subs who both have EPA 608 and a
                  state license, NATE certification is a useful tiebreaker. Verify at{' '}
                  <a href="https://www.natex.org" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">
                    natex.org
                  </a>.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-slate-100">
              Insurance requirements to enforce
            </h2>
            <p className="leading-relaxed">
              HVAC work involves gas lines, electrical connections, and refrigerants — the exposure
              is real. Before any tech steps on site:
            </p>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-amber-500">✓</span>
                <span>
                  <strong className="text-slate-200">General Liability — $1M per occurrence, $2M aggregate minimum.</strong>{' '}
                  Commercial HVAC projects often require higher limits — check your owner contract
                  for pass-through requirements.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-amber-500">✓</span>
                <span>
                  <strong className="text-slate-200">Workers&apos; Compensation</strong> — required for any sub with employees.
                  HVAC work has elevated injury risk from ladder work, confined spaces, and
                  refrigerant exposure.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-amber-500">✓</span>
                <span>
                  <strong className="text-slate-200">Pollution Liability Endorsement</strong> — worth requiring for any work
                  involving refrigerant handling or gas-fired equipment. Refrigerant releases can
                  trigger environmental claims that standard GL policies exclude.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-amber-500">✓</span>
                <span>
                  <strong className="text-slate-200">Your company named as additional insured</strong> — on every certificate,
                  every time. Non-negotiable.
                </span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-slate-100">
              Red flags when evaluating an HVAC sub
            </h2>
            <ul className="space-y-3">
              {[
                'No EPA 608 card or cannot state their certification type — this is a federal compliance issue, not a minor gap',
                'License is for a different state or jurisdiction than your project location',
                'Insurance certificate lists a residential-only policy for a commercial project — check the policy type, not just the limits',
                'Cannot explain which refrigerant types they are certified to handle',
                'No pull permits or assumes the GC handles permitting — HVAC subs typically pull their own mechanical permits',
                'Quotes significantly below market without a clear reason — often signals unlicensed or uninsured work',
                'No service experience with the equipment brand or system type specified in your project',
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
              What to include in an HVAC subcontract
            </h2>
            <p className="leading-relaxed">
              HVAC subcontracts need a few specifics beyond a standard sub agreement:
            </p>
            <ul className="mt-4 space-y-2">
              {[
                'Specific equipment make, model, and tonnage to be installed — no generic references',
                'Refrigerant type and who is responsible for procurement and disposal',
                'Applicable codes: ASHRAE, International Mechanical Code, local amendments',
                'Testing and commissioning requirements — static pressure tests, airflow balancing, startup documentation',
                'Who pulls the mechanical permit and who is responsible for inspections',
                'Warranty terms — manufacturer warranty passthrough plus labor warranty (typically 1 year)',
                'Schedule milestones: rough-in, equipment set, final connections, startup',
                'Payment tied to inspection milestones, not calendar dates',
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
              Where to find verified HVAC subcontractors
            </h2>
            <p className="leading-relaxed">
              Hard Hat Social manually reviews every HVAC technician&apos;s EPA 608 certification,
              state license, and insurance before approving their profile. You can filter by
              specialty, state, and certification type.
            </p>
            <p className="mt-4 leading-relaxed">
              Other reliable sources:
            </p>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-amber-500">·</span>
                <span>
                  <strong className="text-slate-200">ACCA (Air Conditioning Contractors of America)</strong> — trade association
                  with a contractor locator at acca.org. Members are bound by a code of ethics
                  and most carry current certifications
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-amber-500">·</span>
                <span>
                  <strong className="text-slate-200">SMACNA (Sheet Metal and Air Conditioning Contractors&apos; National Association)</strong> — for
                  duct fabrication and commercial mechanical work; members are typically signatory
                  union contractors with strong certification programs
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-amber-500">·</span>
                <span>
                  <strong className="text-slate-200">Referrals from MEP engineers</strong> — mechanical engineers who spec systems
                  often know who actually installs them well. If you have an MEP on the project,
                  ask for names
                </span>
              </li>
            </ul>

            <div className="mt-8 rounded-lg border border-amber-500/20 bg-amber-500/5 p-6 text-center">
              <p className="font-semibold text-slate-100">Find a verified HVAC subcontractor now</p>
              <p className="mt-2 text-sm text-slate-400">
                Browse EPA 608-certified HVAC technicians and licensed mechanical contractors —
                all manually verified.
              </p>
              <Link
                href="/hvac-contractors"
                className="mt-5 inline-flex rounded-md bg-amber-500 px-7 py-3 font-semibold text-slate-950 hover:bg-amber-400 transition-colors"
              >
                Browse HVAC Contractors
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
                  q: 'What certifications should an HVAC subcontractor have?',
                  a: 'At minimum: EPA Section 608 certification (federal law — not optional), a current state HVAC or mechanical contractor license for the jurisdiction where work is being performed, and proof of general liability insurance. Universal EPA 608 is standard for commercial work.',
                },
                {
                  q: 'Is EPA 608 certification required for HVAC subcontractors?',
                  a: 'Yes. It is federal law under Section 608 of the Clean Air Act. Anyone who purchases or handles refrigerants must be certified. Violations can result in fines up to $44,539 per day. Hiring an uncertified sub does not shield you from federal enforcement.',
                },
                {
                  q: 'What does an HVAC state contractor license cover?',
                  a: 'It authorizes the holder to legally install, modify, or service HVAC systems in that jurisdiction. Requirements vary by state and sometimes by city. Always verify the sub has the right license for your specific project location — a license in one state or city may not be valid in another.',
                },
                {
                  q: 'What insurance should an HVAC subcontractor carry?',
                  a: 'General liability at $1M per occurrence minimum, workers\' comp if they have employees, your company as additional insured, and ideally a pollution liability endorsement for refrigerant handling. Commercial projects often require $2M aggregate GL — check your owner contract.',
                },
                {
                  q: 'Where can I find verified HVAC subcontractors?',
                  a: 'Hard Hat Social maintains a directory of manually verified HVAC subcontractors — EPA 608 certification, state license, and insurance all checked before profiles go live. Filter by specialty and state.',
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
            Need a verified HVAC subcontractor?
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            <Link
              href="/hvac-contractors"
              className="rounded-md bg-amber-500 px-6 py-3 font-semibold text-slate-950 hover:bg-amber-400 transition-colors"
            >
              Browse HVAC Contractors
            </Link>
            <Link
              href="/apply"
              className="rounded-md border border-slate-600 px-6 py-3 font-semibold text-slate-200 hover:border-slate-400 transition-colors"
            >
              Apply as an HVAC Tech
            </Link>
          </div>
        </div>

      </div>
    </>
  )
}
