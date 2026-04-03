import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          {/* Brand */}
          <div>
            <p className="text-sm font-semibold text-slate-100">Hard Hat Social</p>
            <p className="mt-1 text-xs text-slate-500">
              The verified network for all tradespeople.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-400">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">Platform</p>
              <Link href="/contractors" className="hover:text-slate-100 transition-colors">
                Directory
              </Link>
              <Link href="/apply" className="hover:text-slate-100 transition-colors">
                Apply
              </Link>
              <Link href="/explore" className="hover:text-slate-100 transition-colors">
                Explore
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">Guides</p>
              <Link href="/guides/find-welding-subcontractor" className="hover:text-slate-100 transition-colors">
                Find a Welder
              </Link>
              <Link href="/guides/find-hvac-subcontractor" className="hover:text-slate-100 transition-colors">
                Find an HVAC Sub
              </Link>
              <Link href="/guides/find-electrical-subcontractor" className="hover:text-slate-100 transition-colors">
                Find an Electrician
              </Link>
              <Link href="/guides/find-plumbing-subcontractor" className="hover:text-slate-100 transition-colors">
                Find a Plumber
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">Company</p>
              <Link href="/about" className="hover:text-slate-100 transition-colors">
                About
              </Link>
              <Link href="/privacy" className="hover:text-slate-100 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-slate-100 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-6">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} Hard Hat Social. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
