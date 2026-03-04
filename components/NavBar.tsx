'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'

export default function NavBar() {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchUsername(session.user.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        fetchUsername(session.user.id)
      } else {
        setUsername(null)
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
    <nav className="border-b border-slate-800 bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <a href="/" className="flex items-center gap-1">
            <span className="text-xl font-bold text-amber-500">Contractors</span>
            <span className="text-xl font-bold text-slate-100">Connect</span>
          </a>

          <div className="flex items-center gap-2">
            {/* Desktop nav — hidden below md breakpoint */}
            <div className="hidden md:flex items-center gap-6">
              <a
                href="/contractors"
                className="text-sm text-slate-400 hover:text-slate-100 transition-colors"
              >
                Directory
              </a>
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
                  className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400 transition-colors"
                >
                  Sign In
                </a>
              )}
            </div>

            {/* Hamburger — visible below md breakpoint only */}
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
                <div className="absolute right-0 mt-2 w-56 rounded-md border border-slate-700 bg-slate-800 shadow-lg">
                  <a
                    href="/contractors"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-slate-100 transition-colors rounded-t-md"
                  >
                    Directory
                  </a>
                  <a
                    href="/explore"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-slate-100 transition-colors"
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
                      className="block px-4 py-3 text-sm font-semibold text-amber-400 hover:bg-slate-700 transition-colors rounded-b-md"
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
