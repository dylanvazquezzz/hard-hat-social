import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Hard Hat Social terms of service — rules for using the platform, contractor verification requirements, and account policies.',
}

const EFFECTIVE_DATE = 'April 1, 2026'

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-100">Terms of Service</h1>
      <p className="mt-2 text-sm text-slate-500">Effective date: {EFFECTIVE_DATE}</p>

      <p className="mt-6 text-slate-400 leading-relaxed">
        By creating an account or using hardhatsocial.net, you agree to these terms. If
        you do not agree, do not use the platform.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-slate-100">Eligibility</h2>
      <p className="mt-4 text-slate-400 leading-relaxed">
        Hard Hat Social is for licensed, credentialed tradespeople and businesses that work
        with them. You must be 18 or older and legally authorized to work in your trade in
        your jurisdiction to apply for a verified account.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-slate-100">Verification requirements</h2>
      <p className="mt-4 text-slate-400 leading-relaxed">
        To be listed as a verified contractor, you must submit accurate, current, and
        authentic credentials including trade certifications, a valid contractor license,
        and proof of insurance. Submitting false, expired, or fraudulent documents is
        grounds for immediate removal and may be reported to the relevant licensing body.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-slate-100">Your account</h2>
      <p className="mt-4 text-slate-400 leading-relaxed">
        You are responsible for keeping your account credentials secure and for all activity
        that occurs under your account. Notify us immediately at{' '}
        <a href="mailto:hello@hardhatsocial.net" className="text-amber-400 hover:underline">
          hello@hardhatsocial.net
        </a>{' '}
        if you believe your account has been compromised.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-slate-100">Prohibited conduct</h2>
      <p className="mt-4 text-slate-400 leading-relaxed">You may not:</p>
      <ul className="mt-3 space-y-2 pl-5 text-slate-400 list-disc">
        <li>Submit false or misleading information during application or on your profile</li>
        <li>Use the platform to spam, harass, or solicit other users</li>
        <li>Scrape, copy, or redistribute directory data without written permission</li>
        <li>Attempt to circumvent the verification process</li>
        <li>Use another person&apos;s credentials or identity</li>
        <li>Engage in any activity that violates applicable law</li>
      </ul>

      <h2 className="mt-10 text-xl font-semibold text-slate-100">Account termination</h2>
      <p className="mt-4 text-slate-400 leading-relaxed">
        We reserve the right to suspend or terminate any account at any time if we determine
        that you have violated these terms, provided false credentials, or engaged in conduct
        harmful to the platform or its users. You may close your account at any time by
        contacting us.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-slate-100">Disclaimer of warranties</h2>
      <p className="mt-4 text-slate-400 leading-relaxed">
        Hard Hat Social is provided &ldquo;as is&rdquo; without warranties of any kind.
        We do not guarantee uninterrupted access, the accuracy of any contractor&apos;s
        credentials beyond what we verified at the time of approval, or any particular
        outcome from using the platform.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-slate-100">Limitation of liability</h2>
      <p className="mt-4 text-slate-400 leading-relaxed">
        To the maximum extent permitted by law, Hard Hat Social shall not be liable for
        any indirect, incidental, or consequential damages arising from your use of the
        platform.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-slate-100">Changes to these terms</h2>
      <p className="mt-4 text-slate-400 leading-relaxed">
        We may update these terms at any time. Continued use of the platform after changes
        are posted constitutes acceptance.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-slate-100">Contact</h2>
      <p className="mt-4 text-slate-400 leading-relaxed">
        Questions about these terms:{' '}
        <a href="mailto:hello@hardhatsocial.net" className="text-amber-400 hover:underline">
          hello@hardhatsocial.net
        </a>
      </p>
    </div>
  )
}
