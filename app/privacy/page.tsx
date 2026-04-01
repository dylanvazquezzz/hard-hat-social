import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Hard Hat Social privacy policy — how we collect, use, and protect your personal information.',
}

const EFFECTIVE_DATE = 'April 1, 2026'

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-100">Privacy Policy</h1>
      <p className="mt-2 text-sm text-slate-500">Effective date: {EFFECTIVE_DATE}</p>

      <p className="mt-6 text-slate-400 leading-relaxed">
        Hard Hat Social (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) operates
        hardhatsocial.net. This policy explains what information we collect, how we use it,
        and what rights you have.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-slate-100">Information we collect</h2>
      <p className="mt-4 text-slate-400 leading-relaxed">
        When you create an account or submit an application, we collect:
      </p>
      <ul className="mt-3 space-y-2 pl-5 text-slate-400 list-disc">
        <li>Name, email address, and phone number</li>
        <li>Trade, specialties, location (city and state), and years of experience</li>
        <li>Certification documents, license numbers, and proof of insurance uploaded during application</li>
        <li>Profile photo, bio, and website if you choose to provide them</li>
      </ul>
      <p className="mt-4 text-slate-400 leading-relaxed">
        When you use the platform, we may also collect:
      </p>
      <ul className="mt-3 space-y-2 pl-5 text-slate-400 list-disc">
        <li>Log data including IP address, browser type, and pages visited</li>
        <li>Usage data such as searches performed and profiles viewed</li>
      </ul>

      <h2 className="mt-10 text-xl font-semibold text-slate-100">How we use your information</h2>
      <ul className="mt-4 space-y-2 pl-5 text-slate-400 list-disc">
        <li>To review your application and verify your credentials</li>
        <li>To display your public profile to other approved members</li>
        <li>To send you notifications about your application status or account activity</li>
        <li>To improve the platform and diagnose technical issues</li>
      </ul>
      <p className="mt-4 text-slate-400 leading-relaxed">
        We do not sell your personal information. We do not share it with third parties
        except as described below.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-slate-100">Service providers</h2>
      <p className="mt-4 text-slate-400 leading-relaxed">
        We use Supabase as our database and authentication provider. Your data is stored
        on Supabase&apos;s infrastructure. We use Vercel to host the application. These
        providers have their own privacy policies governing how they handle data.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-slate-100">Data retention</h2>
      <p className="mt-4 text-slate-400 leading-relaxed">
        We retain your profile data for as long as your account is active. If you request
        deletion, we will remove your personal information within 30 days, except where
        we are required to retain it for legal reasons.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-slate-100">Your rights</h2>
      <p className="mt-4 text-slate-400 leading-relaxed">
        You may request access to, correction of, or deletion of your personal data at any
        time by contacting us at{' '}
        <a href="mailto:hello@hardhatsocial.net" className="text-amber-400 hover:underline">
          hello@hardhatsocial.net
        </a>
        .
      </p>

      <h2 className="mt-10 text-xl font-semibold text-slate-100">Changes to this policy</h2>
      <p className="mt-4 text-slate-400 leading-relaxed">
        We may update this policy from time to time. Material changes will be communicated
        via email or a notice on the platform. Continued use after changes take effect
        constitutes acceptance of the updated policy.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-slate-100">Contact</h2>
      <p className="mt-4 text-slate-400 leading-relaxed">
        Privacy questions or requests:{' '}
        <a href="mailto:hello@hardhatsocial.net" className="text-amber-400 hover:underline">
          hello@hardhatsocial.net
        </a>
      </p>
    </div>
  )
}
