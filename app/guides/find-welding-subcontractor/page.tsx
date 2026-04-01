import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'How to Find a Verified Welding Subcontractor',
  description:
    'A practical guide for general contractors and project owners on finding, vetting, and hiring a qualified welding subcontractor — certifications to look for, red flags to avoid, and where to find verified welders.',
  openGraph: {
    title: 'How to Find a Verified Welding Subcontractor | Hard Hat Social',
    description:
      'A practical guide on finding and hiring a qualified welding subcontractor — AWS certifications, insurance requirements, and where to find verified welders.',
    url: 'https://hardhatsocial.net/guides/find-welding-subcontractor',
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What certifications should a welding subcontractor have?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'At minimum, look for AWS (American Welding Society) certification, a current state contractor license where required, and proof of general liability insurance. For structural work, D1.1 or D1.5 certification is standard. For pipe welding, look for ASME Section IX or API 1104 qualifications.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I verify a welder\'s AWS certification?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'AWS certified welders carry a wallet card with their certification number and expiration date. You can verify certification status directly through the AWS certification verification portal at aws.org. Always check the expiration date — AWS certifications must be renewed every 3 years.',
      },
    },
    {
      '@type': 'Question',
      name: 'What insurance should a welding subcontractor carry?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'General liability insurance is the minimum — typically $1M per occurrence, $2M aggregate for commercial work. For larger projects, you may also want workers\' compensation insurance if the welder has employees, and umbrella coverage. Always request a certificate of insurance (COI) naming your company as an additional insured.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is a fair rate for a welding subcontractor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Rates vary significantly by specialty, region, and project type. TIG welders and pipe welders typically command higher rates than MIG or stick welders due to the skill required. As a rough benchmark, certified welding subcontractors in the US typically bill between $75–$150/hour depending on specialty and location. Structural and pressure vessel work runs higher.',
      },
    },
    {
      '@type': 'Question',
      name: 'Where can I find verified welding subcontractors?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Hard Hat Social maintains a directory of manually verified welding subcontractors — every welder has been checked for AWS certification, state license, and insurance before their profile goes live. You can search by specialty, state, and certification type.',
      },
    },
  ],
}

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'How to Find a Verified Welding Subcontractor',
  description:
    'A practical guide for general contractors and project owners on finding, vetting, and hiring a qualified welding subcontractor.',
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
    '@id': 'https://hardhatsocial.net/guides/find-welding-subcontractor',
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
      name: 'How to Find a Verified Welding Subcontractor',
      item: 'https://hardhatsocial.net/guides/find-welding-subcontractor',
    },
  ],
}

export default function FindWeldingSubcontractorPage() {
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
          <span className="text-slate-400">Find a Welding Subcontractor</span>
        </nav>

        {/* Header */}
        <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber-500">
          Guide
        </div>
        <h1 className="text-4xl font-bold leading-tight text-slate-100">
          How to Find a Verified Welding Subcontractor
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-400">
          Finding a qualified welding sub isn&apos;t hard if you know what to look for.
          This guide covers the certifications that matter, the insurance you should require,
          the red flags to watch for, and where to find welders who&apos;ve already been vetted.
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
              Why this is harder than it should be
            </h2>
            <p className="leading-relaxed">
              Most contractor directories let anyone sign up. That means when you search
              for a welding subcontractor, you&apos;re looking at a mix of certified
              professionals and people who bought a welder last year and called themselves
              a contractor. There&apos;s no easy way to tell the difference from a profile.
            </p>
            <p className="mt-4 leading-relaxed">
              The result: GCs waste time chasing unqualified subs, or worse, hire someone
              who fails inspection because their certifications don&apos;t cover the spec.
              For structural steel, pressure vessels, or pipe welding — where the wrong
              weld can have serious consequences — this isn&apos;t a minor inconvenience.
              It&apos;s a liability.
            </p>
            <p className="mt-4 leading-relaxed">
              The fix is knowing exactly what to ask for and where to verify it before
              anyone picks up a torch.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-slate-100">
              Certifications that actually matter
            </h2>
            <p className="leading-relaxed">
              Not all welding certifications are equal, and which one matters depends on
              your project type. Here&apos;s what to look for:
            </p>

            <div className="mt-6 space-y-5">
              <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
                <h3 className="font-semibold text-slate-100">AWS Certified Welder (CW)</h3>
                <p className="mt-2 text-sm leading-relaxed">
                  Issued by the{' '}
                  <a href="https://www.aws.org" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">
                    American Welding Society
                  </a>
                  , this is the most widely recognized welding credential in the US.
                  It tests performance to a specific welding procedure — a welder certified
                  for one process (e.g. TIG on stainless) isn&apos;t automatically certified
                  for another (e.g. MIG on carbon steel). Always confirm the certification
                  covers the process and material your job requires. Certifications expire
                  every 3 years unless maintained.
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
                <h3 className="font-semibold text-slate-100">AWS D1.1 — Structural Welding (Steel)</h3>
                <p className="mt-2 text-sm leading-relaxed">
                  The standard for structural steel welding. Required on most commercial
                  construction and infrastructure projects. If your project involves structural
                  connections, beams, or columns — this is the cert to ask for specifically.
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
                <h3 className="font-semibold text-slate-100">AWS D1.5 — Bridge Welding</h3>
                <p className="mt-2 text-sm leading-relaxed">
                  Used on highway bridges and infrastructure projects funded through AASHTO
                  standards. More stringent than D1.1. Required on DOT-funded bridge work.
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
                <h3 className="font-semibold text-slate-100">ASME Section IX / API 1104 — Pipe Welding</h3>
                <p className="mt-2 text-sm leading-relaxed">
                  For pressure piping, boilers, and oil/gas pipelines. ASME Section IX covers
                  pressure vessels and piping systems; API 1104 is specific to pipeline
                  welding. Pipe welders with these qualifications are in high demand and
                  command premium rates.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-slate-100">
              Insurance requirements to enforce
            </h2>
            <p className="leading-relaxed">
              Before any welder steps on your job site, you should have a certificate of
              insurance (COI) in hand. Here&apos;s the minimum to require:
            </p>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-amber-500">✓</span>
                <span>
                  <strong className="text-slate-200">General Liability — $1M per occurrence, $2M aggregate.</strong>{' '}
                  Standard for commercial work. Some project owners require higher limits — check your contract.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-amber-500">✓</span>
                <span>
                  <strong className="text-slate-200">Workers&apos; Compensation</strong> — required if the sub has employees.
                  A sole proprietor working alone may be exempt in some states, but get
                  written confirmation.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-amber-500">✓</span>
                <span>
                  <strong className="text-slate-200">Your company named as additional insured.</strong>{' '}
                  This is non-negotiable. If it&apos;s not on the COI, ask the sub to have their
                  broker add it — it takes one email and costs nothing.
                </span>
              </li>
            </ul>
            <p className="mt-4 leading-relaxed">
              Always verify the COI directly with the issuing insurance company or through
              a verification service — don&apos;t just accept a PDF. Fraudulent COIs exist.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-slate-100">
              Red flags when evaluating a welding sub
            </h2>
            <ul className="space-y-3">
              {[
                'Can\'t produce an AWS wallet card or certification number on request — real certifications have verifiable numbers',
                'Certification covers a different process or material than your job requires',
                'Insurance certificate has an expiration date in the past (surprisingly common)',
                'No state contractor license in states where welding contractors are required to be licensed',
                'Unwilling to provide references from similar project types',
                'Quotes significantly below market rate without a clear explanation — often a sign of no insurance or unlicensed work',
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
              What to include in a subcontract agreement
            </h2>
            <p className="leading-relaxed">
              Even for short engagements, a written subcontract protects both parties.
              At minimum, cover:
            </p>
            <ul className="mt-4 space-y-2">
              {[
                'Specific welding procedures and applicable codes (AWS D1.1, ASME, etc.)',
                'Inspection and testing requirements (visual, ultrasonic, X-ray)',
                'Who supplies consumables — wire, rod, gas, PPE',
                'Schedule and milestone dates',
                'Payment terms — net 30, progress billing, or lump sum',
                'Warranty on welds — typical is 1 year on workmanship defects',
                'Indemnification and insurance requirements',
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
              Where to find verified welding subcontractors
            </h2>
            <p className="leading-relaxed">
              The fastest option is a directory where verification has already been done.
              Hard Hat Social manually reviews every welder&apos;s AWS certification, state
              license, and insurance before approving their profile. You can filter by
              specialty (TIG, pipe, structural), state, and certification type.
            </p>
            <p className="mt-4 leading-relaxed">
              Other options worth knowing:
            </p>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-amber-500">·</span>
                <span>
                  <strong className="text-slate-200">AWS local sections</strong> — the American Welding Society has regional chapters
                  that maintain member directories and can refer certified welders in your area
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-amber-500">·</span>
                <span>
                  <strong className="text-slate-200">Trade unions (IBEW, UA, Iron Workers)</strong> — union halls can dispatch
                  qualified welders quickly for larger projects; all members carry current
                  certifications as a condition of membership
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-amber-500">·</span>
                <span>
                  <strong className="text-slate-200">Referrals from other GCs</strong> — still the most reliable source for
                  smaller markets; a welder who did good work for a peer is a lower-risk hire
                  than a cold search
                </span>
              </li>
            </ul>

            <div className="mt-8 rounded-lg border border-amber-500/20 bg-amber-500/5 p-6 text-center">
              <p className="font-semibold text-slate-100">Find a verified welder now</p>
              <p className="mt-2 text-sm text-slate-400">
                Browse AWS-certified welders, pipe welders, and structural specialists —
                all manually verified.
              </p>
              <Link
                href="/welding-contractors"
                className="mt-5 inline-flex rounded-md bg-amber-500 px-7 py-3 font-semibold text-slate-950 hover:bg-amber-400 transition-colors"
              >
                Browse Welding Contractors
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
                  q: 'What certifications should a welding subcontractor have?',
                  a: 'At minimum: AWS certification covering the specific process and material your job requires, a current state contractor license where required, and proof of general liability insurance. For structural work, ask for D1.1 or D1.5 specifically. For pipe work, ASME Section IX or API 1104.',
                },
                {
                  q: "How do I verify a welder's AWS certification?",
                  a: "AWS certified welders carry a wallet card with their certification number and expiration date. You can verify status directly through the AWS certification portal at aws.org. Always check the expiration — certifications must be renewed every 3 years.",
                },
                {
                  q: 'What insurance should a welding subcontractor carry?',
                  a: 'General liability at $1M per occurrence minimum, workers\' comp if they have employees, and your company named as additional insured on the COI. Verify the certificate directly with the broker — don\'t just accept a PDF.',
                },
                {
                  q: 'What is a fair rate for a welding subcontractor?',
                  a: 'Certified welding subcontractors in the US typically bill $75–$150/hour depending on specialty and region. TIG, pipe, and structural welders run higher than MIG or stick. Pressure vessel and pipeline work runs highest.',
                },
                {
                  q: 'Where can I find verified welding subcontractors?',
                  a: 'Hard Hat Social maintains a directory of manually verified welders — AWS certification, state license, and insurance all checked before profiles go live. Filter by specialty, state, and certification type.',
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
            Need a verified welding subcontractor?
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            <Link
              href="/welding-contractors"
              className="rounded-md bg-amber-500 px-6 py-3 font-semibold text-slate-950 hover:bg-amber-400 transition-colors"
            >
              Browse Welders
            </Link>
            <Link
              href="/apply"
              className="rounded-md border border-slate-600 px-6 py-3 font-semibold text-slate-200 hover:border-slate-400 transition-colors"
            >
              Apply as a Welder
            </Link>
          </div>
        </div>

      </div>
    </>
  )
}
