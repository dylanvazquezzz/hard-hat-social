import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Verified Plumbing Contractors | Hard Hat Social',
  description:
    'Find verified plumbers and plumbing contractors on Hard Hat Social. State-licensed, insured, and manually reviewed — commercial, residential, pipefitting, and gas lines.',
  openGraph: {
    title: 'Verified Plumbing Contractors | Hard Hat Social',
    description:
      'Browse state-licensed plumbing contractors — commercial, residential, pipefitting, fire suppression, and gas line specialists. All verified.',
    url: 'https://hardhatsocial.net/plumbing-contractors',
  },
}

export default function PlumbingContractorsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber-500">Trade Directory</div>
      <h1 className="text-4xl font-bold text-slate-100">Verified Plumbing Contractors</h1>
      <p className="mt-4 text-lg text-slate-400">
        Every plumber on Hard Hat Social holds a valid state license and proof of insurance —
        checked manually before their profile goes live.
      </p>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link href="/contractors?trade=Plumbing" className="rounded-md bg-amber-500 px-6 py-3 font-semibold text-slate-950 hover:bg-amber-400 transition-colors">Browse Plumbing Contractors</Link>
        <Link href="/apply" className="rounded-md border border-slate-600 px-6 py-3 font-semibold text-slate-200 hover:border-slate-400 transition-colors">Apply as a Plumber</Link>
      </div>

      <div className="mt-14 space-y-10">
        <section>
          <h2 className="text-2xl font-semibold text-slate-100">Why verified plumbers matter</h2>
          <p className="mt-4 text-slate-400 leading-relaxed">
            Plumbing work touches potable water, sanitation, and — in the case of gas lines —
            public safety. Every state requires licensed plumbers for permitted work, and
            failing to use a licensed contractor can void homeowner insurance and create
            significant liability. For commercial projects, unlicensed plumbing is a
            code violation that can result in failed inspections and costly rework.
          </p>
          <p className="mt-4 text-slate-400 leading-relaxed">
            Hard Hat Social verifies state plumber licenses, checks insurance certificates,
            and confirms authorization to work in the contractor&apos;s jurisdiction before
            approving any profile. Specialties include commercial and residential plumbing,
            pipefitting, fire suppression, and gas line installation.
          </p>
          <p className="mt-4 text-slate-400 leading-relaxed">
            Gas line work in particular requires specific endorsements or separate licensing
            in many states. Contractors who list gas lines as a specialty are verified for
            that scope specifically.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-100">Plumbing specialties on the platform</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {['Commercial Plumbing', 'Residential Plumbing', 'Pipefitting', 'Fire Suppression', 'Gas Lines'].map((s) => (
              <div key={s} className="rounded-md border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300">{s}</div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-100">Credentials we verify</h2>
          <ul className="mt-4 space-y-3 text-slate-400">
            <li className="flex items-start gap-3"><span className="mt-0.5 text-amber-500">✓</span><span><strong className="text-slate-200">State Plumber License</strong> — journeyman or master plumber license, verified</span></li>
            <li className="flex items-start gap-3"><span className="mt-0.5 text-amber-500">✓</span><span><strong className="text-slate-200">General Liability Insurance</strong> — current certificate required</span></li>
          </ul>
        </section>
      </div>

      <div className="mt-14 rounded-lg border border-amber-500/20 bg-amber-500/5 p-8 text-center">
        <h2 className="text-xl font-semibold text-slate-100">Find a verified plumber</h2>
        <p className="mt-2 text-slate-400">Browse the directory, filtered to plumbing.</p>
        <Link href="/contractors?trade=Plumbing" className="mt-6 inline-flex rounded-md bg-amber-500 px-8 py-3 font-semibold text-slate-950 hover:bg-amber-400 transition-colors">Browse Plumbing Contractors</Link>
      </div>
    </div>
  )
}
