import Link from 'next/link'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { TRADES } from '@/lib/constants'

// Trade icons (SVG paths) for the Browse by Trade grid
const TRADE_ICONS: Record<string, string> = {
  Welding: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  HVAC: 'M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 10 16H2m15.73-8.27A2 2 0 1 1 19 12H2',
  Electrical: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  Plumbing: 'M12 22V12m0 0V2m0 10H2m10 0h10',
  'General Contractor': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  Drywall: 'M4 4h16v4H4zM4 12h16v4H4zM4 20h16',
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

  return (
    <div>
      {/* ── Hero — full-bleed B&W trade photo background ─────────────────── */}
      <section className="relative min-h-[520px] sm:min-h-[600px] flex items-center overflow-hidden">
        {/* Photo collage — 4 panels, grayscale, slight parallax feel */}
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 sm:grid-cols-4 sm:grid-rows-1">
          {/* Welder */}
          <div
            className="bg-cover bg-center grayscale brightness-50"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=60&fm=jpg')" }}
          />
          {/* HVAC tech */}
          <div
            className="bg-cover bg-center grayscale brightness-50"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&q=60&fm=jpg')" }}
          />
          {/* Electrician */}
          <div
            className="bg-cover bg-center grayscale brightness-50"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=600&q=60&fm=jpg')" }}
          />
          {/* Carpenter / drywall */}
          <div
            className="bg-cover bg-center grayscale brightness-50"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1508450859948-4e04fabaa4ea?w=600&q=60&fm=jpg')" }}
          />
        </div>

        {/* Dark overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/70 to-slate-950/90" />

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
                href={`/contractors?trade=${encodeURIComponent(trade)}`}
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
