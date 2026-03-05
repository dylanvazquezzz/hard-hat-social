import type { Metadata } from 'next'
import './globals.css'
import NavBar from '@/components/NavBar'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://hardhatsocial.net'),
  title: 'Hard Hat Social — Verified Contractor Network',
  description:
    'A curated network of verified, credentialed contractors. Find trusted welders, HVAC techs, electricians, and more.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-brand-dark text-brand-text-primary">
        <NavBar />
        <main>{children}</main>
      </body>
    </html>
  )
}
