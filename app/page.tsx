import Link from 'next/link'

const TRADES = ['Welding', 'HVAC', 'Electrical', 'Plumbing', 'General Contractor']

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-slate-900 px-4 py-24 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-sm text-amber-400">
            Verified contractors only — no spam, no unqualified applicants
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-100 sm:text-5xl lg:text-6xl">
            The trusted network for{' '}
            <span className="text-amber-500">trade professionals</span>
          </h1>
          <p className="mt-6 text-lg text-slate-400">
            Find credentialed contractors for subcontracting and referrals. Every contractor on this
            platform has been manually verified.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/contractors"
              className="w-full rounded-md bg-amber-500 px-6 py-3 text-base font-semibold text-slate-950 hover:bg-amber-400 transition-colors sm:w-auto"
            >
              Browse Directory
            </Link>
            <Link
              href="/apply"
              className="w-full rounded-md border border-slate-700 px-6 py-3 text-base font-semibold text-slate-100 hover:border-slate-500 transition-colors sm:w-auto"
            >
              Apply as a Contractor
            </Link>
          </div>
        </div>
      </section>

      {/* Browse by trade */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Browse by Trade
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {TRADES.map((trade) => (
              <Link
                key={trade}
                href={`/contractors?trade=${encodeURIComponent(trade)}`}
                className="flex items-center justify-center rounded-lg border border-slate-800 bg-slate-900 px-4 py-5 text-sm font-medium text-slate-300 hover:border-amber-500/50 hover:text-amber-400 transition-colors"
              >
                {trade}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-slate-800 bg-slate-900 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 text-2xl font-bold text-slate-100">How it works</h2>
          <div className="grid gap-10 sm:grid-cols-3">
            <div>
              <div className="mb-3 text-4xl font-bold text-amber-500">01</div>
              <h3 className="mb-2 text-lg font-semibold text-slate-100">
                Apply & submit credentials
              </h3>
              <p className="text-sm text-slate-400">
                Submit your trade certifications, license, and proof of insurance for review.
              </p>
            </div>
            <div>
              <div className="mb-3 text-4xl font-bold text-amber-500">02</div>
              <h3 className="mb-2 text-lg font-semibold text-slate-100">Manual verification</h3>
              <p className="text-sm text-slate-400">
                Our team reviews your documents and approves qualified contractors. No shortcuts.
              </p>
            </div>
            <div>
              <div className="mb-3 text-4xl font-bold text-amber-500">03</div>
              <h3 className="mb-2 text-lg font-semibold text-slate-100">Find & connect</h3>
              <p className="text-sm text-slate-400">
                Browse the directory, filter by trade and location, and reach out directly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
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
