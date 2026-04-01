import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Hard Hat Social is a verified contractor network built for tradespeople. Learn about our mission, our verification process, and the team behind the platform.',
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-100">About Hard Hat Social</h1>

      <p className="mt-6 text-slate-400 leading-relaxed">
        Hard Hat Social is a verified contractor network built exclusively for credentialed
        tradespeople. The goal is simple: make it easy for qualified contractors to find
        each other without wading through unverified profiles, spam, and dead leads.
      </p>

      <h2 className="mt-12 text-xl font-semibold text-slate-100">Why we built this</h2>
      <p className="mt-4 text-slate-400 leading-relaxed">
        The problem with most contractor directories is that anyone can sign up. That means
        homeowners and GCs spend hours vetting people who turn out to be uninsured, uncertified,
        or simply not who they claimed to be. The founding team has worked in the trades and seen
        this firsthand — a welder who spent two weeks chasing a sub who turned out to have no
        current AWS certification.
      </p>
      <p className="mt-4 text-slate-400 leading-relaxed">
        Hard Hat Social flips the model. Every contractor on this platform has been manually
        reviewed. You know the people you see in this directory are real, credentialed professionals.
        That trust is the entire point.
      </p>

      <h2 className="mt-12 text-xl font-semibold text-slate-100">How verification works</h2>
      <p className="mt-4 text-slate-400 leading-relaxed">
        When a contractor applies, they submit their trade credentials, state license, and proof
        of insurance. A human on our team reviews every document. We check expiration dates,
        validate license numbers where possible, and confirm the issuing body is legitimate.
        If everything checks out, the application is approved and the contractor&apos;s profile
        goes live. If something&apos;s missing or expired, we reach out and give them a chance
        to provide updated documentation.
      </p>
      <p className="mt-4 text-slate-400 leading-relaxed">
        We do not automate this review. Manual review is slower, but it&apos;s the only way to
        maintain the quality standard that makes the platform worth using.
      </p>

      <h2 className="mt-12 text-xl font-semibold text-slate-100">What we support today</h2>
      <p className="mt-4 text-slate-400 leading-relaxed">
        We started with welding because that&apos;s where the founding team has the deepest
        network and the clearest sense of what verification should look like. We now support
        Welding, HVAC, Electrical, Plumbing, General Contracting, and Drywall — with more
        trades on the roadmap.
      </p>

      <h2 className="mt-12 text-xl font-semibold text-slate-100">Contact</h2>
      <p className="mt-4 text-slate-400 leading-relaxed">
        Questions, feedback, or issues with an application? Reach us at{' '}
        <a
          href="mailto:hello@hardhatsocial.net"
          className="text-amber-400 hover:underline"
        >
          hello@hardhatsocial.net
        </a>
        .
      </p>
    </div>
  )
}
