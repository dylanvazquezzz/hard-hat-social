import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { TRADES } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Hard Hat Social — Verified Contractor Network',
  description:
    'Find and connect with verified, credentialed contractors across welding, HVAC, electrical, plumbing, and more. Apply to join the trusted trade network.',
  openGraph: {
    title: 'Hard Hat Social — Verified Contractor Network',
    description:
      'Find and connect with verified, credentialed contractors across welding, HVAC, electrical, plumbing, and more.',
    url: 'https://hardhatsocial.net',
  },
}

// Trade icons (SVG paths) for the Browse by Trade grid
const TRADE_ICONS: Record<string, string> = {
  Welding: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  HVAC: 'M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 10 16H2m15.73-8.27A2 2 0 1 1 19 12H2',
  Electrical: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  Plumbing: 'M12 22V12m0 0V2m0 10H2m10 0h10',
  'General Contractor': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  Drywall: 'M4 4h16v4H4zM4 12h16v4H4zM4 20h16',
}

// Trade landing page routes
const TRADE_LANDING: Record<string, string> = {
  Welding: '/welding-contractors',
  HVAC: '/hvac-contractors',
  Electrical: '/electrical-contractors',
  Plumbing: '/plumbing-contractors',
  'General Contractor': '/general-contractors',
  Drywall: '/drywall-contractors',
}

export const revalidate = 3600

export default async function HomePage() {
  const admin = getSupabaseAdmin()

  const [
    { count: approvedCount },
    { data: tradesData },
    { count: applicationsCount },
  ] = await Promise.all([
    admin
      .from('contractors')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved'),
    admin
      .from('contractors')
      .select('trade')
      .eq('status', 'approved'),
    admin
      .from('applications')
      .select('*', { count: 'exact', head: true }),
  ])

  const distinctTrades = new Set((tradesData ?? []).map((r) => r.trade)).size

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Hard Hat Social',
    url: 'https://hardhatsocial.net',
    logo: 'https://hardhatsocial.net/og-default.png',
    description:
      'A curated network of verified, credentialed contractors. Find trusted welders, HVAC techs, electricians, and more.',
    sameAs: [],
  }

  const webSiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Hard Hat Social',
    url: 'https://hardhatsocial.net',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://hardhatsocial.net/contractors?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is Hard Hat Social?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Hard Hat Social is a verified contractor network built exclusively for credentialed tradespeople. Every contractor on the platform has been manually reviewed and approved — no self-certifications, no unqualified applicants.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I get verified on Hard Hat Social?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Submit your application with your trade certifications, contractor license, and proof of insurance. Our team reviews every document manually. Welders need AWS certification or equivalent; HVAC techs need EPA 608; electricians and plumbers need their state license.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is Hard Hat Social free to join?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes — the core platform is free. You can apply, get verified, build a profile, and browse the full directory at no cost.',
        },
      },
      {
        '@type': 'Question',
        name: 'What trades are on Hard Hat Social?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Hard Hat Social currently supports Welding, HVAC, Electrical, Plumbing, General Contracting, and Drywall. More trades will be added as the network grows.',
        },
      },
      {
        '@type': 'Question',
        name: 'How long does the Hard Hat Social verification process take?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Most applications are reviewed within 2–5 business days. You\'ll receive an email notification once your application is approved or if additional documentation is needed.',
        },
      },
    ],
  }

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {/* ── Hero — full-bleed B&W trade photo background ─────────────────── */}
      <section className="relative min-h-[520px] sm:min-h-[600px] flex items-center overflow-hidden">
        {/* Photo collage — 4 panels, full color, all IDs visually verified on Unsplash */}
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 sm:grid-cols-4 sm:grid-rows-1">
          {/* Welder — golden sparks flying */}
          <div className="relative overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80"
              alt="Certified welder at work with golden sparks flying"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, 25vw"
              priority
            />
          </div>
          {/* Electrician — amber work jacket, colored wires */}
          <div className="relative overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1682345262055-8f95f3c513ea?w=800&q=80"
              alt="Licensed electrician working with colored wires"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, 25vw"
              priority
            />
          </div>
          {/* Lineman — red hard hat, orange hi-vis vest on power tower */}
          <div className="relative overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1555963966-b7ae5404b6ed?w=800&q=80"
              alt="Power lineman in red hard hat and hi-vis vest on utility tower"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, 25vw"
              priority
            />
          </div>
          {/* Carpenter — wood framing on build site, blue sky */}
          <div className="relative overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1632862378913-b4fe820ce73b?w=800&q=80"
              alt="Carpenter framing a building on a construction site"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, 25vw"
              priority
            />
          </div>
        </div>

        {/* Dark overlay — lighter so color reads through */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/65 via-slate-950/55 to-slate-950/80" />

        {/* Subtle amber edge glow */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

        {/* Hero content */}
        <div className="relative z-10 mx-auto w-full max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            Verified contractors only — no spam, no unqualified applicants
          </div>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            The verified network for{' '}
            <span className="text-amber-400 whitespace-nowrap">all tradespeople</span>
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-slate-300">
            Apply, get verified, and connect with credentialed subs in your trade.
            No spam. No unqualified people. Just vetted professionals.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/apply"
              className="w-full rounded-md bg-amber-500 px-7 py-3 text-base font-semibold text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-colors sm:w-auto"
            >
              Apply as a Contractor
            </Link>
            <Link
              href="/contractors"
              className="w-full rounded-md border border-slate-500 bg-slate-900/50 px-7 py-3 text-base font-semibold text-slate-100 backdrop-blur-sm hover:border-slate-400 hover:bg-slate-800/60 transition-colors sm:w-auto"
            >
              Browse Directory
            </Link>
          </div>

          <p className="mt-8 text-sm text-slate-500">
            <span className="text-slate-400 font-medium">{approvedCount ?? 0}</span> verified contractors
            {' · '}
            <span className="text-slate-400 font-medium">{distinctTrades}</span> trades
            {' · '}
            <span className="text-slate-400 font-medium">{applicationsCount ?? 0}</span> applications reviewed
          </p>
        </div>
      </section>

      {/* ── Browse by Trade — separated by border ────────────────────────── */}
      <section className="border-t border-slate-800 px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center gap-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Browse by Trade
            </h2>
            <div className="flex-1 border-t border-slate-800" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {TRADES.map((trade) => (
              <Link
                key={trade}
                href={TRADE_LANDING[trade] ?? `/contractors?trade=${encodeURIComponent(trade)}`}
                className="group flex flex-col items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-4 py-5 text-center transition-all hover:border-amber-500/40 hover:bg-slate-800"
              >
                <svg
                  className="h-5 w-5 text-slate-600 transition-colors group-hover:text-amber-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={TRADE_ICONS[trade]} />
                </svg>
                <span className="text-sm font-medium text-slate-300 group-hover:text-amber-400 transition-colors">
                  {trade}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="border-t border-slate-800 bg-slate-900 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 text-2xl font-bold text-slate-100">How it works</h2>
          <div className="grid gap-10 sm:grid-cols-3">
            <div>
              <div className="mb-3 text-4xl font-bold text-amber-500">01</div>
              <h3 className="mb-2 text-lg font-semibold text-slate-100">
                Submit your credentials
              </h3>
              <p className="text-sm text-slate-400">
                Upload your trade certifications, license, and proof of insurance for manual review.
              </p>
            </div>
            <div>
              <div className="mb-3 text-4xl font-bold text-amber-500">02</div>
              <h3 className="mb-2 text-lg font-semibold text-slate-100">Get verified</h3>
              <p className="text-sm text-slate-400">
                Our team reviews your documents. Qualified tradespeople get approved. No shortcuts.
              </p>
            </div>
            <div>
              <div className="mb-3 text-4xl font-bold text-amber-500">03</div>
              <h3 className="mb-2 text-lg font-semibold text-slate-100">Find subs and connect</h3>
              <p className="text-sm text-slate-400">
                Browse the directory, filter by trade and location, and reach out directly to credentialed subs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="border-t border-slate-800 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-10 text-2xl font-bold text-slate-100">Frequently asked questions</h2>
          <div className="space-y-6">
            {[
              {
                q: 'What is Hard Hat Social?',
                a: 'Hard Hat Social is a verified contractor network built exclusively for credentialed tradespeople. Every contractor on the platform has been manually reviewed and approved — no self-certifications, no unqualified applicants. The platform helps contractors find verified subs, share availability, and connect with other professionals in their trade.',
              },
              {
                q: 'How do I get verified?',
                a: 'Submit your application with your trade certifications, contractor license, and proof of insurance. Our team reviews every document manually. If everything checks out, you\'re approved and your profile goes live. Welders need AWS certification or equivalent; HVAC techs need EPA 608; electricians and plumbers need their state license.',
              },
              {
                q: 'Is Hard Hat Social free to join?',
                a: 'Yes — the core platform is free. You can apply, get verified, build a profile, and browse the full directory at no cost. A premium tier with priority placement, profile analytics, and additional features is planned for the future.',
              },
              {
                q: 'What trades are currently on the platform?',
                a: 'Hard Hat Social currently supports Welding, HVAC, Electrical, Plumbing, General Contracting, and Drywall. More trades will be added as the network grows. If your trade isn\'t listed, apply anyway — we review all applications.',
              },
              {
                q: 'How long does the verification process take?',
                a: 'Most applications are reviewed within 2–5 business days. If we need additional documentation or have questions about your credentials, we\'ll reach out by email. You\'ll receive a notification once your application is approved or if any action is required.',
              },
            ].map(({ q, a }) => (
              <div key={q} className="rounded-lg border border-slate-800 bg-slate-900 p-6">
                <h3 className="mb-3 text-base font-semibold text-slate-100">{q}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section className="border-t border-slate-800 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-center gap-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              From verified contractors
            </h2>
            <div className="flex-1 border-t border-slate-800" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                quote:
                  'Found a certified pipe welder two states away in under ten minutes. Couldn\'t have done that on any other platform — everyone here actually checks out.',
                name: 'Marcus T.',
                trade: 'Structural Welder',
                location: 'Houston, TX',
              },
              {
                quote:
                  'I\'ve tried every contractor directory out there. This is the first one where I don\'t have to explain what AWS means to people. The bar for getting in is real.',
                name: 'Diane R.',
                trade: 'General Contractor',
                location: 'Phoenix, AZ',
              },
              {
                quote:
                  'Got approved in three days. Profile went live and I had two subcontracting leads within the first week. The quality of the people here is different.',
                name: 'James K.',
                trade: 'HVAC Technician',
                location: 'Atlanta, GA',
              },
            ].map(({ quote, name, trade, location }) => (
              <figure
                key={name}
                className="flex flex-col justify-between rounded-lg border border-slate-800 bg-slate-900 p-6"
              >
                <blockquote className="text-sm leading-relaxed text-slate-300">
                  &ldquo;{quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 text-xs font-bold text-amber-400">
                    {name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{name}</p>
                    <p className="text-xs text-slate-500">
                      {trade} · {location}
                    </p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-slate-100">Ready to get verified?</h2>
          <p className="mt-4 text-slate-400">
            Join the network. Only qualified tradespeople allowed.
          </p>
          <Link
            href="/apply"
            className="mt-8 inline-flex rounded-md bg-amber-500 px-8 py-3 text-base font-semibold text-slate-950 hover:bg-amber-400 transition-colors"
          >
            Start Your Application
          </Link>
        </div>
      </section>
    </div>
  )
}
