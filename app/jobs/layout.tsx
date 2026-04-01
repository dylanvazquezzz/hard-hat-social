import type { Metadata } from 'next'
import JobsGuard from './JobsGuard'

export const metadata: Metadata = {
  title: 'Job Board',
  description:
    'Browse and post subcontracting opportunities on Hard Hat Social. Find qualified trade professionals for your next project.',
  openGraph: {
    title: 'Job Board | Hard Hat Social',
    description:
      'Browse and post subcontracting opportunities. Find verified welders, HVAC techs, electricians, and more for your project.',
    url: 'https://hardhatsocial.net/jobs',
  },
}

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return <JobsGuard>{children}</JobsGuard>
}
