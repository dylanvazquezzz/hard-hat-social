import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'How to Find a Verified Plumbing Subcontractor',
  description:
    'A practical guide for general contractors and project owners on finding, vetting, and hiring a qualified plumbing subcontractor — state licensing, insurance, backflow certification, and where to find verified plumbers.',
  openGraph: {
    title: 'How to Find a Verified Plumbing Subcontractor | Hard Hat Social',
    description:
      'A practical guide on finding and hiring a qualified plumbing subcontractor — state licensing, insurance requirements, backflow certification, and where to find verified plumbers.',
    url: 'https://hardhatsocial.net/guides/find-plumbing-subcontractor',
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What licenses does a plumbing subcontractor need?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most states require a licensed Plumbing Contractor license for the business entity and individual plumber licenses (Journeyman and/or Master Plumber) for the people performing the work. Requirements vary significantly by state. Some states have comprehensive statewide licensing; others defer to local jurisdictions. Always verify both the company license and the individual licenses of plumbers on your job site.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is backflow prevention certification and when is it required?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Backflow prevention certification authorizes plumbers to install, test, and maintain backflow prevention assemblies — devices that prevent contaminated water from flowing back into the potable water supply. Required for commercial and multi-unit residential projects in most jurisdictions. Certified testers are licensed separately from general plumbing licenses. Verify your sub has the correct backflow certification if your project involves irrigation, fire suppression, or commercial water connections.',
      },
    },
    {
      '@type': 'Question',
      name: 'What insurance should a plumbing subcontractor carry?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'General liability at $1M per occurrence minimum, workers\' compensation for employees, and your company named as additional insured. Plumbing work has significant water damage exposure — a failed connection can cause substantial property damage. Commercial projects often require $2M aggregate GL. Verify the certificate directly with the issuing broker.',
      },
    },
    {
      '@type': 'Question',
      name: 'Who is responsible for plumbing permits?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The licensed plumbing contractor performing the work is responsible for pulling the plumbing permit in most jurisdictions. This is separate from the building permit the GC holds. Make permit responsibility explicit in the subcontract — who pulls, who attends rough-in and final inspections, and what happens to the permit if the sub is terminated.',
      },
    },
    {
      '@type': 'Question',
      name: 'Where can I find verified plumbing subcontractors?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Hard Hat Social maintains a directory of manually verified plumbing subcontractors — state license and insurance checked before profiles go live. You can search by specialty, state, and certification type.',
      },
    },
  ],
}

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'How to Find a Verified Plumbing Subcontractor',
  description:
    'A practical guide for general contractors and project owners on finding, vetting, and hiring a qualified plumbing subcontractor.',
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
    '@id': 'https://hardhatsocial.net/guides/find-plumbing-subcontractor',
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
      name: 'How to Find a Verified Plumbing Subcontractor',
      item: 'https://hardhatsocial.net/guides/find-plumbing-subcontractor',
    },
  ],
}

export default function FindPlumbingSubcontractorPage() {
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
          <span className="text-slate-400">Find a Plumbing Subcontractor</span>
        </nav>

        {/* Header */}
        <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber-500">
          Guide
        </div>
        <h1 className="text-4xl font-bold leading-tight text-slate-100">
          How to Find a Verified Plumbing Subcontractor
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-400">
          Plumbing failures are expensive — water damage claims average in the tens of thousands,
          and code violations can halt a project. This guide covers the licenses to check,
          the insurance to require, and where to find plumbers who&apos;ve already been vetted.
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
              The risk profile of plumbing subcontracting
            </h2>
            <p className="leading-relaxed">
              Plumbing failures don&apos;t always show up immediately. A poorly soldered joint or
              an improperly sloped drain line can cause damage weeks or months after the project
              closes — after your warranty exposure has started but before the failure becomes
              visible. By the time water damage is discovered, it&apos;s typically inside a wall
              or under a slab, and the remediation is expensive.
            </p>
            <p className="mt-4 leading-relaxed">
              This makes vetting your plumbing sub more consequential than it might appear.
              A licensed, insured plumber with a track record on similar project types is worth
              the extra due diligence. The cost of a bad hire surfaces long after the check
              clears.
            </p>
            <p className="mt-4 leading-relaxed">
              The other issue specific to plumbing: potable water contamination. An unlicensed
              plumber who incorrectly installs a cross-connection can contaminate a building&apos;s
              water supply. In commercial projects, this can trigger regulatory action beyond
              a standard insurance claim.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-slate-100">
              Licenses and certifications to verify
            </h2>

            <div className="mt-6 space-y-5">
              <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
                <h3 className="font-semibold text-slate-100">Plumbing Contractor License</h3>
                <p className="mt-2 text-sm leading-relaxed">
                  The company-level license authorizing the business to perform plumbing work for hire.
                  Most states require this separately from a general contractor license. Verify it&apos;s
                  current and covers the project type (residential, commercial, or industrial — some
                  states have separate license tiers). State licensing databases are searchable online.
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
                <h3 className="font-semibold text-slate-100">Master Plumber License</h3>
                <p className="mt-2 text-sm leading-relaxed">
                  The highest individual plumber license. Requires completing an apprenticeship
                  (typically 4–5 years), working as a Journeyman for 1–2 years, and passing a
                  comprehensive exam on plumbing codes. Most states require a Master Plumber to
                  be on record with the company and responsible for supervising work and pulling permits.
                  Verify the Master Plumber associated with your sub is active in your state.
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
                <h3 className="font-semibold text-slate-100">Journeyman Plumber License</h3>
                <p className="mt-2 text-sm leading-relaxed">
                  Authorizes individuals to perform plumbing work under Master supervision. A
                  properly staffed job site has licensed Journeymen performing the work, not
                  unsupervised apprentices. Ask for the crew&apos;s license information for larger
                  projects, especially in jurisdictions with strict inspection regimes.
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
                <h3 className="font-semibold text-slate-100">Backflow Prevention Certification</h3>
                <p className="mt-2 text-sm leading-relaxed">
                  Required for installing, testing, and maintaining backflow prevention assemblies.
                  Issued separately from general plumbing licenses — typically by the state health
                  department or a recognized testing organization. Required on virtually all commercial
                  projects and multi-unit residential. Verify through your local water utility or
                  the American Backflow Prevention Association (ABPA) at abpa-home.org.
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
                <h3 className="font-semibold text-slate-100">Medical Gas Certification (when applicable)</h3>
                <p className="mt-2 text-sm leading-relaxed">
                  For healthcare and laboratory projects. ASSE 6010 (medical gas installer) and
                  ASSE 6020 (medical gas inspector) are the standard credentials. Most plumbing
                  subs do not have these — if your project involves medical gas piping, verify
                  specifically. NFPA 99 governs medical gas systems and inspections.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-slate-100">
              Insurance requirements to enforce
            </h2>
            <p className="leading-relaxed">
              Plumbing has high water damage and property damage exposure. Before any plumber
              breaks ground:
            </p>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-amber-500">✓</span>
                <span>
                  <strong className="text-slate-200">General Liability — $1M per occurrence minimum.</strong>{' '}
                  Commercial projects commonly require $2M aggregate. Check your owner contract
                  for pass-through requirements — plumbing subs are often specifically named in
                  owner-required insurance schedules.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-amber-500">✓</span>
                <span>
                  <strong className="text-slate-200">Workers&apos; Compensation</strong> — plumbing work involves confined
                  spaces, excavation, and overhead work. Injury risk is real. Required for any
                  sub with employees.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-amber-500">✓</span>
                <span>
                  <strong className="text-slate-200">Your company as additional insured</strong> — always. Verify on the COI,
                  confirm with the broker.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-amber-500">✓</span>
                <span>
                  <strong className="text-slate-200">Completed Operations Coverage</strong> — verify the GL policy includes
                  completed operations coverage, which extends protection to claims that arise after
                  project completion. Water damage from plumbing failures often surfaces months later —
                  a policy that terminates at project closeout leaves you exposed.
                </span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-slate-100">
              Red flags when evaluating a plumbing sub
            </h2>
            <ul className="space-y-3">
              {[
                'Cannot produce both the company\'s contractor license and the Master Plumber license on record with the company',
                'License is issued in a different state or jurisdiction than your project',
                'No backflow certification on a commercial project — this is a code requirement in virtually all jurisdictions',
                'GL policy does not include completed operations coverage — a standard exclusion in cheaper policies',
                'Has not pulled permits on comparable projects — experienced plumbing subs know the permit process cold',
                'Cannot provide references from similar project types (commercial vs. residential are meaningfully different)',
                'Workers on site are unlicensed apprentices performing work that requires a Journeyman',
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
              What to include in a plumbing subcontract
            </h2>
            <ul className="mt-4 space-y-2">
              {[
                'Specific scope: fixture count and type, pipe material specifications, service size and meter size',
                'Applicable code: IPC (International Plumbing Code) or UPC (Uniform Plumbing Code) — varies by jurisdiction',
                'Who pulls the plumbing permit and who attends rough-in, DWV, and final inspections',
                'Pressure testing requirements and documentation — hydrostatic test results should be logged',
                'Coordination requirements: underground plumbing before slab pour, rough-in before drywall',
                'Backflow prevention assembly type and testing certification requirements',
                'Warranty on workmanship — typically 1 year on labor; manufacturer warranties passed through on fixtures and equipment',
                'Cleanup requirements — plumbing work generates debris and water; make responsibility explicit',
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
              Where to find verified plumbing subcontractors
            </h2>
            <p className="leading-relaxed">
              Hard Hat Social manually reviews every plumbing subcontractor&apos;s state license
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
                  <strong className="text-slate-200">UA (United Association of Plumbers and Pipefitters)</strong> — union
                  halls dispatch licensed Journeymen and Pipe Fitters. All UA members carry
                  current licenses and are regularly trained. Strong option for larger commercial
                  or industrial projects at ua.org
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-amber-500">·</span>
                <span>
                  <strong className="text-slate-200">PHCC (Plumbing-Heating-Cooling Contractors Association)</strong> — trade
                  association at phccweb.org with a contractor locator. PHCC members are typically
                  licensed and carry required insurance as a condition of membership
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-amber-500">·</span>
                <span>
                  <strong className="text-slate-200">State licensing board databases</strong> — verify license status directly
                  before hiring. Plumbing contractor licenses lapse and are not always self-reported.
                  Takes two minutes and eliminates a significant category of risk
                </span>
              </li>
            </ul>

            <div className="mt-8 rounded-lg border border-amber-500/20 bg-amber-500/5 p-6 text-center">
              <p className="font-semibold text-slate-100">Find a verified plumbing subcontractor now</p>
              <p className="mt-2 text-sm text-slate-400">
                Browse licensed plumbing contractors and Master Plumbers —
                all manually verified before profiles go live.
              </p>
              <Link
                href="/plumbing-contractors"
                className="mt-5 inline-flex rounded-md bg-amber-500 px-7 py-3 font-semibold text-slate-950 hover:bg-amber-400 transition-colors"
              >
                Browse Plumbing Contractors
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
                  q: 'What licenses does a plumbing subcontractor need?',
                  a: 'Two layers: the company needs a Plumbing Contractor license, and the individuals on site need current Journeyman or Master Plumber licenses. Both must be active in the state and jurisdiction where work is performed. Verify both in the state licensing database — licenses lapse and subs don\'t always self-report.',
                },
                {
                  q: 'What is backflow prevention certification and when is it required?',
                  a: 'Backflow certification authorizes plumbers to install and test backflow prevention assemblies — required on virtually all commercial projects to prevent contaminated water from flowing back into the potable supply. It\'s issued separately from the general plumbing license. Verify through your local water utility or the ABPA.',
                },
                {
                  q: 'What insurance should a plumbing subcontractor carry?',
                  a: 'GL at $1M per occurrence minimum (commercial work typically requires $2M aggregate), workers\' comp for employees, your company as additional insured, and completed operations coverage to protect against claims that surface after project completion. Check your owner contract for pass-through insurance requirements.',
                },
                {
                  q: 'Who is responsible for plumbing permits?',
                  a: 'The licensed plumbing contractor performing the work, in most jurisdictions. Not the GC. Make it explicit in the subcontract: who pulls the permit, who attends rough-in and final inspections, and what happens to the permit if the sub is replaced mid-project.',
                },
                {
                  q: 'Where can I find verified plumbing subcontractors?',
                  a: 'Hard Hat Social maintains a directory of manually verified plumbing subcontractors — state license and insurance checked before profiles go live. Filter by specialty and state. Also check state licensing board databases and UA/PHCC for union and association contractors.',
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
            Need a verified plumbing subcontractor?
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            <Link
              href="/plumbing-contractors"
              className="rounded-md bg-amber-500 px-6 py-3 font-semibold text-slate-950 hover:bg-amber-400 transition-colors"
            >
              Browse Plumbers
            </Link>
            <Link
              href="/apply"
              className="rounded-md border border-slate-600 px-6 py-3 font-semibold text-slate-200 hover:border-slate-400 transition-colors"
            >
              Apply as a Plumber
            </Link>
          </div>
        </div>

      </div>
    </>
  )
}
