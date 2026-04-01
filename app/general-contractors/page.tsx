import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Verified General Contractors | Hard Hat Social',
  description:
    'Find verified general contractors on Hard Hat Social. State-licensed, bonded, insured, and manually reviewed — remodeling, new construction, and commercial build-outs.',
  openGraph: {
    title: 'Verified General Contractors | Hard Hat Social',
    description:
      'Browse verified general contractors — remodeling, new construction, commercial build-out, and concrete. State license and insurance verified.',
    url: 'https://hardhatsocial.net/general-contractors',
  },
}

export default function GeneralContractorsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber-500">Trade Directory</div>
      <h1 className="text-4xl font-bold text-slate-100">Verified General Contractors</h1>
      <p className="mt-4 text-lg text-slate-400">
        Every GC on Hard Hat Social holds a valid state contractor license and proof of
        insurance — manually reviewed before their profile goes live.
      </p>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link href="/contractors?trade=General+Contractor" className="rounded-md bg-amber-500 px-6 py-3 font-semibold text-slate-950 hover:bg-amber-400 transition-colors">Browse General Contractors</Link>
        <Link href="/apply" className="rounded-md border border-slate-600 px-6 py-3 font-semibold text-slate-200 hover:border-slate-400 transition-colors">Apply as a GC</Link>
      </div>

      <div className="mt-14 space-y-10">
        <section>
          <h2 className="text-2xl font-semibold text-slate-100">Why verified general contractors matter</h2>
          <p className="mt-4 text-slate-400 leading-relaxed">
            A general contractor manages trades, schedules, and coordinates the entire build.
            When a GC is unlicensed or uninsured, the liability flows to the owner. Most
            states require a GC license for projects above a certain dollar threshold, and
            bonding is often required to pull permits or work on public projects.
          </p>
          <p className="mt-4 text-slate-400 leading-relaxed">
            Hard Hat Social verifies state contractor licenses, checks insurance and bonding
            certificates, and confirms the GC is authorized to work in their jurisdiction.
            The platform also serves as a connection point between GCs looking for qualified
            subs and tradespeople looking for general contractors who run organized, compliant
            projects.
          </p>
          <p className="mt-4 text-slate-400 leading-relaxed">
            Whether you&apos;re a homeowner finding a GC for a major remodel, a developer
            sourcing for a commercial build-out, or a subcontractor looking for a GC with
            steady work, the verified network ensures everyone you contact meets a real
            credential standard.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-100">GC specialties on the platform</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {['Remodeling', 'New Construction', 'Commercial Build-Out', 'Concrete'].map((s) => (
              <div key={s} className="rounded-md border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300">{s}</div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-100">Credentials we verify</h2>
          <ul className="mt-4 space-y-3 text-slate-400">
            <li className="flex items-start gap-3"><span className="mt-0.5 text-amber-500">✓</span><span><strong className="text-slate-200">State GC License</strong> — general contractor license verified for jurisdiction</span></li>
            <li className="flex items-start gap-3"><span className="mt-0.5 text-amber-500">✓</span><span><strong className="text-slate-200">General Liability Insurance</strong> — current certificate required</span></li>
            <li className="flex items-start gap-3"><span className="mt-0.5 text-amber-500">✓</span><span><strong className="text-slate-200">Bonding</strong> — bonding documentation accepted as supporting credential</span></li>
          </ul>
        </section>
      </div>

      <div className="mt-14 rounded-lg border border-amber-500/20 bg-amber-500/5 p-8 text-center">
        <h2 className="text-xl font-semibold text-slate-100">Find a verified general contractor</h2>
        <p className="mt-2 text-slate-400">Browse the directory, filtered to general contractors.</p>
        <Link href="/contractors?trade=General+Contractor" className="mt-6 inline-flex rounded-md bg-amber-500 px-8 py-3 font-semibold text-slate-950 hover:bg-amber-400 transition-colors">Browse General Contractors</Link>
      </div>
    </div>
  )
}
