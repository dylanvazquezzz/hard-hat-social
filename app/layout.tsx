import type { Metadata } from 'next'
import './globals.css'
import NavBar from '@/components/NavBar'
import Footer from '@/components/Footer'
import ThemeProvider from '@/components/ThemeProvider'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://hardhatsocial.net'),
  title: {
    default: 'Hard Hat Social — Verified Contractor Network',
    template: '%s | Hard Hat Social',
  },
  description:
    'A curated network of verified, credentialed contractors. Find trusted welders, HVAC techs, electricians, and more.',
  openGraph: {
    type: 'website',
    siteName: 'Hard Hat Social',
    title: 'Hard Hat Social — Verified Contractor Network',
    description:
      'A curated network of verified, credentialed contractors. Find trusted welders, HVAC techs, electricians, and more.',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'Hard Hat Social — Verified Contractor Network',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hard Hat Social — Verified Contractor Network',
    description:
      'A curated network of verified, credentialed contractors. Find trusted welders, HVAC techs, electricians, and more.',
    images: ['/og-default.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body className="flex min-h-screen flex-col antialiased" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>
        <ThemeProvider>
          <NavBar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
