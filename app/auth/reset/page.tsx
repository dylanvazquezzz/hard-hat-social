'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }

    setLoading(false)
  }

  return (
    <div className="mx-auto max-w-md px-4 py-24 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-100">Reset Password</h1>
        <p className="mt-2 text-sm text-slate-400">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      {sent ? (
        <div className="rounded-md bg-slate-800 px-4 py-6 text-center">
          <p className="text-sm text-slate-300">
            Check your email for a password reset link.
          </p>
          <a href="/auth" className="mt-4 inline-block text-sm text-amber-400 hover:text-amber-300">
            Back to sign in
          </a>
        </div>
      ) : (
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

          {error && (
            <div className="rounded-md bg-slate-800 px-4 py-3 text-sm text-slate-300">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-amber-500 px-6 py-3 text-base font-semibold text-slate-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
          >
            {loading ? '...' : 'Send Reset Link'}
          </button>

          <p className="text-center text-sm text-slate-400">
            <a href="/auth" className="text-amber-400 hover:text-amber-300">
              Back to sign in
            </a>
          </p>
        </form>
      )}
    </div>
  )
}
