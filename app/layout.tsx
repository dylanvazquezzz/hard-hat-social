import type { Metadata } from 'next'
import './globals.css'
import NavBar from '@/components/NavBar'

export const metadata: Metadata = {
  metadataBase: new URL('https://contractors-connect.vercel.app'),
  title: 'Contractors Connect — Verified Contractor Network',
  description:
    'A curated network of verified, credentialed contractors. Find trusted welders, HVAC techs, electricians, and more.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <NavBar />
        <main>{children}</main>
      </body>
    </html>
  )
}
