import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Contractor Hiring Guides',
  description:
    'Practical guides for general contractors and project owners on finding, vetting, and hiring verified subcontractors — welding, HVAC, electrical, plumbing, and more.',
  openGraph: {
    title: 'Contractor Hiring Guides | Hard Hat Social',
    description:
      'Practical guides on finding and hiring verified subcontractors — certifications to require, insurance to check, red flags to avoid.',
    url: 'https://hardhatsocial.net/guides',
  },
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://hardhatsocial.net' },
    { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://hardhatsocial.net/guides' },
  ],
}

const guides = [
  {
    href: '/guides/find-welding-subcontractor',
    trade: 'Welding',
    title: 'How to Find a Verified Welding Subcontractor',
    description:
      'AWS certifications, D1.1 structural qualifications, pipe welding credentials, insurance requirements, and red flags to watch for.',
    readTime: '6 min read',
    cta: '/welding-contractors',
    ctaLabel: 'Browse Welders',
  },
  {
    href: '/guides/find-hvac-subcontractor',
    trade: 'HVAC',
    title: 'How to Find a Verified HVAC Subcontractor',
    description:
      'EPA 608 certification requirements, state licensing complexity, pollution liability, and what to include in an HVAC subcontract.',
    readTime: '6 min read',
    cta: '/hvac-contractors',
    ctaLabel: 'Browse HVAC Contractors',
  },
  {
    href: '/guides/find-electrical-subcontractor',
    trade: 'Electrical',
    title: 'How to Find a Verified Electrical Subcontractor',
    description:
      'Company vs individual licensing layers, Master and Journeyman license requirements, permit responsibility, and OSHA requirements.',
    readTime: '6 min read',
    cta: '/electrical-contractors',
    ctaLabel: 'Browse Electricians',
  },
  {
    href: '/guides/find-plumbing-subcontractor',
    trade: 'Plumbing',
    title: 'How to Find a Verified Plumbing Subcontractor',
    description:
      'State plumbing licenses, backflow prevention certification, completed operations coverage, and the potable water contamination risk most GCs miss.',
    readTime: '6 min read',
    cta: '/plumbing-contractors',
    ctaLabel: 'Browse Plumbers',
  },
]

export default function GuidesIndexPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-400">Guides</span>
        </nav>

        {/* Header */}
        <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber-500">
          Resources
        </div>
        <h1 className="text-4xl font-bold leading-tight text-slate-100">
          Contractor Hiring Guides
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-400">
          Practical guides for general contractors and project owners on finding, vetting,
          and hiring verified subcontractors. What certifications to require, what insurance
          to check, and where to find contractors who&apos;ve already been checked.
        </p>

        <hr className="my-10 border-slate-800" />

        {/* Guide cards */}
        <div className="space-y-6">
          {guides.map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="group block rounded-lg border border-slate-800 bg-slate-900 p-6 transition-colors hover:border-slate-700"
            >
              <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-amber-500">
                {guide.trade}
              </div>
              <h2 className="text-xl font-semibold text-slate-100 group-hover:text-amber-400 transition-colors">
                {guide.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {guide.description}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-slate-600">{guide.readTime}</span>
                <span className="text-xs font-medium text-amber-500 group-hover:underline">
                  Read guide →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 rounded-lg border border-amber-500/20 bg-amber-500/5 p-8 text-center">
          <p className="text-lg font-semibold text-slate-100">
            Ready to find a verified subcontractor?
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Every contractor in the Hard Hat Social directory has been manually verified —
            license, certification, and insurance checked before their profile goes live.
          </p>
          <Link
            href="/contractors"
            className="mt-6 inline-flex rounded-md bg-amber-500 px-8 py-3 font-semibold text-slate-950 hover:bg-amber-400 transition-colors"
          >
            Browse the Directory
          </Link>
        </div>

      </div>
    </>
  )
}
