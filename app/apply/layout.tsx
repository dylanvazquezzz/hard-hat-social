import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Apply as a Contractor',
  description:
    'Submit your trade credentials and apply to join the Hard Hat Social verified contractor network. Manual review — no shortcuts.',
  openGraph: {
    title: 'Apply as a Contractor | Hard Hat Social',
    description:
      'Submit your trade credentials and join the verified contractor network. Welders, HVAC techs, electricians, plumbers, and more welcome.',
    url: 'https://hardhatsocial.net/apply',
  },
}

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
