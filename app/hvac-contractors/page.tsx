import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Verified HVAC Contractors | Hard Hat Social',
  description:
    'Find verified HVAC contractors on Hard Hat Social. EPA 608 certified technicians, commercial and residential HVAC, refrigeration specialists — all manually reviewed.',
  openGraph: {
    title: 'Verified HVAC Contractors | Hard Hat Social',
    description:
      'Browse EPA 608 certified HVAC technicians — commercial HVAC, residential, refrigeration, sheet metal, and controls. All credentials verified.',
    url: 'https://hardhatsocial.net/hvac-contractors',
  },
}

export default function HvacContractorsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber-500">
        Trade Directory
      </div>
      <h1 className="text-4xl font-bold text-slate-100">Verified HVAC Contractors</h1>
      <p className="mt-4 text-lg text-slate-400">
        Every HVAC technician on Hard Hat Social holds a current EPA 608 certification and
        has been manually reviewed. Find the right sub for commercial, residential, or
        refrigeration work.
      </p>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/contractors?trade=HVAC"
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

      <div className="mt-14 space-y-10">
        <section>
          <h2 className="text-2xl font-semibold text-slate-100">Why verified HVAC technicians matter</h2>
          <p className="mt-4 text-slate-400 leading-relaxed">
            HVAC work involves refrigerants regulated under Section 608 of the Clean Air Act.
            Technicians who handle these refrigerants are federally required to hold EPA 608
            certification. Hiring someone without it isn&apos;t just risky — it can expose
            the project owner to liability.
          </p>
          <p className="mt-4 text-slate-400 leading-relaxed">
            Beyond EPA 608, most states require a separate HVAC contractor license and
            proof of general liability insurance. Hard Hat Social verifies all three before
            approving any HVAC technician. You can filter by specialty — commercial systems,
            residential, refrigeration, sheet metal, or controls — and trust that everyone
            you see has cleared the credential bar.
          </p>
          <p className="mt-4 text-slate-400 leading-relaxed">
            For GCs coordinating multi-trade projects, verified HVAC subs reduce the
            vetting burden significantly. The credentials check has already been done.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-100">HVAC specialties on the platform</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {['Commercial HVAC', 'Residential HVAC', 'Refrigeration', 'Sheet Metal', 'Controls & BAS'].map((s) => (
              <div key={s} className="rounded-md border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300">{s}</div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-100">Credentials we verify</h2>
          <ul className="mt-4 space-y-3 text-slate-400">
            <li className="flex items-start gap-3"><span className="mt-0.5 text-amber-500">✓</span><span><strong className="text-slate-200">EPA 608 Certification</strong> — federal requirement for refrigerant handling</span></li>
            <li className="flex items-start gap-3"><span className="mt-0.5 text-amber-500">✓</span><span><strong className="text-slate-200">State HVAC Contractor License</strong> — verified against state licensing board records</span></li>
            <li className="flex items-start gap-3"><span className="mt-0.5 text-amber-500">✓</span><span><strong className="text-slate-200">General Liability Insurance</strong> — current certificate required</span></li>
          </ul>
        </section>
      </div>

      <div className="mt-14 rounded-lg border border-amber-500/20 bg-amber-500/5 p-8 text-center">
        <h2 className="text-xl font-semibold text-slate-100">Find a verified HVAC contractor</h2>
        <p className="mt-2 text-slate-400">Browse the full directory, filtered to HVAC.</p>
        <Link href="/contractors?trade=HVAC" className="mt-6 inline-flex rounded-md bg-amber-500 px-8 py-3 font-semibold text-slate-950 hover:bg-amber-400 transition-colors">
          Browse HVAC Contractors
        </Link>
        <p className="mt-4 text-sm text-slate-500">
          Not sure what to look for?{' '}
          <Link href="/guides/find-hvac-subcontractor" className="text-amber-400 hover:underline">
            Read our HVAC hiring guide →
          </Link>
        </p>
      </div>
    </div>
  )
}
