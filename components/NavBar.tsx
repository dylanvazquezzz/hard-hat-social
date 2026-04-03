'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/components/ThemeProvider'
import type { Session } from '@supabase/supabase-js'

export default function NavBar() {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const [session, setSession] = useState<Session | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        fetchUsername(session.user.id)
        if (session?.user?.email) {
          const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '')
            .split(',')
            .map((e) => e.trim().toLowerCase())
          setIsAdmin(adminEmails.includes(session.user.email.toLowerCase()))
        }
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        fetchUsername(session.user.id)
        if (session?.user?.email) {
          const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '')
            .split(',')
            .map((e) => e.trim().toLowerCase())
          setIsAdmin(adminEmails.includes(session.user.email.toLowerCase()))
        }
      } else {
        setUsername(null)
        setIsAdmin(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchUsername(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .single()
    setUsername(data?.username ?? null)
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    setDropdownOpen(false)
    router.push('/')
  }

  return (
    <nav className="relative z-50 border-b border-slate-800 bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <a href="/" className="flex items-center">
            <span className="text-2xl font-bold text-brand-yellow">Hard Hat</span>
            <span className="text-2xl font-bold text-white">&nbsp;Social</span>
          </a>

          <div className="flex items-center gap-2">
            {/* Desktop nav -- hidden below md breakpoint */}
            <div className="hidden md:flex items-center gap-6">
              <a
                href="/explore"
                className="text-sm text-slate-400 hover:text-slate-100 transition-colors"
              >
                Explore
              </a>
              <a
                href="/jobs"
                className="text-sm text-slate-400 hover:text-slate-100 transition-colors"
              >
                Jobs
              </a>
              <a
                href="/contractors"
                className="text-sm text-slate-400 hover:text-slate-100 transition-colors"
              >
                Directory
              </a>
              {!session && (
                <a
                  href="/apply"
                  className="text-sm text-slate-400 hover:text-slate-100 transition-colors"
                >
                  Apply
                </a>
              )}

              {session ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen((o) => !o)}
                    className="flex items-center gap-1 rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-700 transition-colors"
                  >
                    {username ? `@${username}` : 'Account'}
                    <svg
                      className={`h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-44 rounded-md border border-slate-700 bg-slate-800 shadow-lg">
                      <a
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-slate-100 transition-colors rounded-t-md"
                      >
                        Profile
                      </a>
                      {isAdmin && !pathname.startsWith('/admin') && (
                        <a
                          href="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-brand-yellow hover:bg-slate-700 transition-colors"
                        >
                          Admin
                        </a>
                      )}
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-slate-100 transition-colors rounded-b-md"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <a
                  href="/auth"
                  className="rounded-md bg-brand-yellow px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-brand-yellow-dark transition-colors"
                >
                  Sign In
                </a>
              )}
            </div>

            {/* Theme toggle — visible at all breakpoints */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center rounded-md p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? (
                /* Sun icon */
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="5" />
                  <path strokeLinecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              ) : (
                /* Moon icon */
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              )}
            </button>

            {/* Hamburger -- visible below md breakpoint only */}
            <div className="relative md:hidden" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center justify-center rounded-md p-3 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                aria-label="Open navigation menu"
                aria-expanded={menuOpen}
              >
                {menuOpen ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-md border border-slate-700 bg-slate-800 shadow-lg z-50">
                  <a
                    href="/explore"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-slate-100 transition-colors rounded-t-md"
                  >
                    Explore
                  </a>
                  <a
                    href="/jobs"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-slate-100 transition-colors"
                  >
                    Jobs
                  </a>
                  <a
                    href="/contractors"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-slate-100 transition-colors"
                  >
                    Directory
                  </a>
                  {!session && (
                    <a
                      href="/apply"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-slate-100 transition-colors"
                    >
                      Apply
                    </a>
                  )}
                  {session ? (
                    <>
                      <a
                        href="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-slate-100 transition-colors"
                      >
                        {username ? `@${username}` : 'Profile'}
                      </a>
                      {isAdmin && !pathname.startsWith('/admin') && (
                        <a
                          href="/admin"
                          onClick={() => setMenuOpen(false)}
                          className="block px-4 py-3 text-sm text-brand-yellow hover:bg-slate-700 transition-colors"
                        >
                          Admin
                        </a>
                      )}
                      <button
                        onClick={() => { setMenuOpen(false); handleSignOut() }}
                        className="block w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-slate-100 transition-colors rounded-b-md"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <a
                      href="/auth"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-3 text-sm font-semibold text-brand-yellow hover:bg-slate-700 transition-colors rounded-b-md"
                    >
                      Sign In
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
