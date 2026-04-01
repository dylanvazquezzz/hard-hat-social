import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Verified Welding Contractors | Hard Hat Social',
  description:
    'Find verified, credentialed welding contractors on Hard Hat Social. Browse AWS-certified welders, pipe welders, structural welders, and more — all manually reviewed.',
  openGraph: {
    title: 'Verified Welding Contractors | Hard Hat Social',
    description:
      'Browse verified welding contractors — AWS certified, pipe welding, structural welding, TIG, MIG, and more. All credentials manually reviewed.',
    url: 'https://hardhatsocial.net/welding-contractors',
  },
}

export default function WeldingContractorsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber-500">
        Trade Directory
      </div>
      <h1 className="text-4xl font-bold text-slate-100">Verified Welding Contractors</h1>
      <p className="mt-4 text-lg text-slate-400">
        Every welder on Hard Hat Social has been manually verified. Browse AWS-certified
        welders, pipe welders, structural specialists, and more.
      </p>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/contractors?trade=Welding"
          className="rounded-md bg-amber-500 px-6 py-3 font-semibold text-slate-950 hover:bg-amber-400 transition-colors"
        >
          Browse Welding Contractors
        </Link>
        <Link
          href="/apply"
          className="rounded-md border border-slate-600 px-6 py-3 font-semibold text-slate-200 hover:border-slate-400 transition-colors"
        >
          Apply as a Welder
        </Link>
      </div>

      <div className="mt-14 space-y-10">
        <section>
          <h2 className="text-2xl font-semibold text-slate-100">Why verified welders matter</h2>
          <p className="mt-4 text-slate-400 leading-relaxed">
            Welding is one of the most credential-intensive trades. A weld that looks clean
            can fail under load if it wasn&apos;t done to the right standard. That&apos;s why
            certification matters — it tells you the welder has been tested and passed
            by a recognized body, not just by their own word.
          </p>
          <p className="mt-4 text-slate-400 leading-relaxed">
            Hard Hat Social verifies every welder manually. We check AWS (American Welding
            Society) certifications, structural welding qualifications, state contractor
            licenses, and proof of general liability insurance before anyone gets a verified
            profile. If a certification is expired, the application is held until updated
            documentation is provided.
          </p>
          <p className="mt-4 text-slate-400 leading-relaxed">
            For GCs and project owners, this means every welder you find here has cleared
            that bar. You&apos;re not filtering through unverified self-reported profiles —
            you&apos;re browsing a curated list of professionals who have demonstrated their
            qualifications.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-100">Welding specialties on the platform</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              'TIG Welding',
              'MIG Welding',
              'Stick / SMAW Welding',
              'Pipe Welding',
              'Structural Welding',
              'Aluminum Welding',
              'Stainless Steel',
              'Underwater Welding',
            ].map((s) => (
              <div
                key={s}
                className="rounded-md border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300"
              >
                {s}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-100">Credentials we verify</h2>
          <ul className="mt-4 space-y-3 text-slate-400">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 text-amber-500">✓</span>
              <span><strong className="text-slate-200">AWS Certification</strong> — American Welding Society credential, checked against current standards</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 text-amber-500">✓</span>
              <span><strong className="text-slate-200">State Contractor License</strong> — where applicable by jurisdiction</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 text-amber-500">✓</span>
              <span><strong className="text-slate-200">General Liability Insurance</strong> — current certificate of insurance required</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 text-amber-500">✓</span>
              <span><strong className="text-slate-200">D1.1 / D1.5 Structural Certifications</strong> — accepted as additional verification for structural work</span>
            </li>
          </ul>
        </section>
      </div>

      <div className="mt-14 rounded-lg border border-amber-500/20 bg-amber-500/5 p-8 text-center">
        <h2 className="text-xl font-semibold text-slate-100">Ready to find a verified welder?</h2>
        <p className="mt-2 text-slate-400">Browse the full directory, filtered to welding.</p>
        <Link
          href="/contractors?trade=Welding"
          className="mt-6 inline-flex rounded-md bg-amber-500 px-8 py-3 font-semibold text-slate-950 hover:bg-amber-400 transition-colors"
        >
          Browse Welding Contractors
        </Link>
      </div>
    </div>
  )
}
