import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Verified Electrical Contractors | Hard Hat Social',
  description:
    'Find verified electricians and electrical contractors on Hard Hat Social. Licensed, insured, and manually reviewed — commercial, residential, industrial, and solar.',
  openGraph: {
    title: 'Verified Electrical Contractors | Hard Hat Social',
    description:
      'Browse licensed electrical contractors — commercial, residential, industrial, low voltage, solar, and generator systems. All verified.',
    url: 'https://hardhatsocial.net/electrical-contractors',
  },
}

export default function ElectricalContractorsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber-500">Trade Directory</div>
      <h1 className="text-4xl font-bold text-slate-100">Verified Electrical Contractors</h1>
      <p className="mt-4 text-lg text-slate-400">
        Every electrician on Hard Hat Social holds a valid state license and proof of
        insurance — verified manually before their profile goes live.
      </p>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link href="/contractors?trade=Electrical" className="rounded-md bg-amber-500 px-6 py-3 font-semibold text-slate-950 hover:bg-amber-400 transition-colors">Browse Electrical Contractors</Link>
        <Link href="/apply" className="rounded-md border border-slate-600 px-6 py-3 font-semibold text-slate-200 hover:border-slate-400 transition-colors">Apply as an Electrician</Link>
      </div>

      <div className="mt-14 space-y-10">
        <section>
          <h2 className="text-2xl font-semibold text-slate-100">Why verified electricians matter</h2>
          <p className="mt-4 text-slate-400 leading-relaxed">
            Electrical work is one of the most heavily regulated trades. Every state requires
            licensed electricians for permitted work, and for good reason — faulty electrical
            installations are a leading cause of structural fires. Unlicensed work can void
            insurance coverage and create liability exposure for the project owner.
          </p>
          <p className="mt-4 text-slate-400 leading-relaxed">
            Hard Hat Social verifies state electrician licenses, checks that insurance
            certificates are current, and confirms the contractor is authorized to work in
            their state before approving any profile. Whether you need a commercial electrician
            for a build-out, a residential electrician for a remodel, or a low-voltage specialist
            for a data center, every contractor you find here has cleared that bar.
          </p>
          <p className="mt-4 text-slate-400 leading-relaxed">
            The platform also supports emerging specialties — solar installers and generator
            system contractors are increasingly in demand as energy infrastructure evolves.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-100">Electrical specialties on the platform</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {['Commercial Electrical', 'Residential Electrical', 'Industrial Electrical', 'Low Voltage', 'Solar Installation', 'Generator Systems'].map((s) => (
              <div key={s} className="rounded-md border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300">{s}</div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-100">Credentials we verify</h2>
          <ul className="mt-4 space-y-3 text-slate-400">
            <li className="flex items-start gap-3"><span className="mt-0.5 text-amber-500">✓</span><span><strong className="text-slate-200">State Electrician License</strong> — journeyman or master electrician, verified by state</span></li>
            <li className="flex items-start gap-3"><span className="mt-0.5 text-amber-500">✓</span><span><strong className="text-slate-200">General Liability Insurance</strong> — current certificate required</span></li>
          </ul>
        </section>
      </div>

      <div className="mt-14 rounded-lg border border-amber-500/20 bg-amber-500/5 p-8 text-center">
        <h2 className="text-xl font-semibold text-slate-100">Find a verified electrician</h2>
        <p className="mt-2 text-slate-400">Browse the directory, filtered to electrical.</p>
        <Link href="/contractors?trade=Electrical" className="mt-6 inline-flex rounded-md bg-amber-500 px-8 py-3 font-semibold text-slate-950 hover:bg-amber-400 transition-colors">Browse Electrical Contractors</Link>
      </div>
    </div>
  )
}
