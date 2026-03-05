'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Mode = 'signin' | 'signup'

function AuthPageInner() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') ?? '/contractors'

  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setMessage(error.message)
      } else {
        window.location.href = redirectTo
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setMessage(error.message)
      } else {
        setMessage('Check your email to confirm your account.')
      }
    }

    setLoading(false)
  }

  return (
    <div className="mx-auto max-w-md px-4 py-24 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-100">
          {mode === 'signin' ? 'Sign In' : 'Create Account'}
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          {mode === 'signin'
            ? 'Access the verified contractor network.'
            : 'Create an account to apply or browse the directory.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-slate-400">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-sm text-slate-400">Password</label>
            {mode === 'signin' && (
              <a href="/auth/reset" className="text-xs text-amber-400 hover:text-amber-300">
                Forgot password?
              </a>
            )}
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            placeholder="••••••••"
          />
        </div>

        {message && (
          <div className="rounded-md bg-slate-800 px-4 py-3 text-sm text-slate-300">{message}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-amber-500 px-6 py-3 text-base font-semibold text-slate-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
        >
          {loading ? '...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
        <button
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin')
            setMessage('')
          }}
          className="font-medium text-amber-400 hover:text-amber-300"
        >
          {mode === 'signin' ? 'Sign up' : 'Sign in'}
        </button>
      </p>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthPageInner />
    </Suspense>
  )
}
