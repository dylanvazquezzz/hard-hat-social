import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Verified Drywall Contractors | Hard Hat Social',
  description:
    'Find verified drywall contractors on Hard Hat Social. Licensed, insured, and manually reviewed — hanging, taping, finishing, and commercial drywall work.',
  openGraph: {
    title: 'Verified Drywall Contractors | Hard Hat Social',
    description:
      'Browse verified drywall contractors — hanging, taping, finishing, commercial drywall, and acoustic ceilings. All credentials verified.',
    url: 'https://hardhatsocial.net/drywall-contractors',
  },
}

export default function DrywallContractorsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber-500">Trade Directory</div>
      <h1 className="text-4xl font-bold text-slate-100">Verified Drywall Contractors</h1>
      <p className="mt-4 text-lg text-slate-400">
        Every drywall contractor on Hard Hat Social is licensed, insured, and manually
        reviewed before their profile goes live.
      </p>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link href="/contractors?trade=Drywall" className="rounded-md bg-amber-500 px-6 py-3 font-semibold text-slate-950 hover:bg-amber-400 transition-colors">Browse Drywall Contractors</Link>
        <Link href="/apply" className="rounded-md border border-slate-600 px-6 py-3 font-semibold text-slate-200 hover:border-slate-400 transition-colors">Apply as a Drywall Contractor</Link>
      </div>

      <div className="mt-14 space-y-10">
        <section>
          <h2 className="text-2xl font-semibold text-slate-100">Why verified drywall contractors matter</h2>
          <p className="mt-4 text-slate-400 leading-relaxed">
            Drywall work that looks fine from the hall can hide poor fastening, missing fire
            blocking, or inadequate tape and mud work that fails inspection. For commercial
            projects, drywall installation often must meet specific fire-rating standards —
            Type X assemblies, shaft walls, stairwell enclosures — that require contractors
            who understand the specs, not just how to hang board.
          </p>
          <p className="mt-4 text-slate-400 leading-relaxed">
            Hard Hat Social verifies state contractor licenses and general liability insurance
            for all drywall contractors on the platform. Whether you need a framing and
            hanging sub for a large commercial build-out or a finish carpenter who can bring
            drywall to a Level 5 finish, every contractor here has cleared the credential
            verification step.
          </p>
          <p className="mt-4 text-slate-400 leading-relaxed">
            Drywall is often a volume trade on large projects — GCs looking for reliable subs
            who show up, work clean, and pass inspection are the primary audience for this
            part of the directory.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-100">Drywall specialties on the platform</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {['Hanging & Framing', 'Taping & Finishing', 'Commercial Drywall', 'Acoustic Ceilings', 'Level 5 Finish'].map((s) => (
              <div key={s} className="rounded-md border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300">{s}</div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-100">Credentials we verify</h2>
          <ul className="mt-4 space-y-3 text-slate-400">
            <li className="flex items-start gap-3"><span className="mt-0.5 text-amber-500">✓</span><span><strong className="text-slate-200">State Contractor License</strong> — where required by jurisdiction</span></li>
            <li className="flex items-start gap-3"><span className="mt-0.5 text-amber-500">✓</span><span><strong className="text-slate-200">General Liability Insurance</strong> — current certificate required</span></li>
          </ul>
        </section>
      </div>

      <div className="mt-14 rounded-lg border border-amber-500/20 bg-amber-500/5 p-8 text-center">
        <h2 className="text-xl font-semibold text-slate-100">Find a verified drywall contractor</h2>
        <p className="mt-2 text-slate-400">Browse the directory, filtered to drywall.</p>
        <Link href="/contractors?trade=Drywall" className="mt-6 inline-flex rounded-md bg-amber-500 px-8 py-3 font-semibold text-slate-950 hover:bg-amber-400 transition-colors">Browse Drywall Contractors</Link>
      </div>
    </div>
  )
}
