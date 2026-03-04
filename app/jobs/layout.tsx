'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function PendingReviewMessage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-slate-100">Application Under Review</h1>
      <p className="mt-3 text-slate-400">
        Your application is being reviewed by our team. You&apos;ll receive an email once
        it&apos;s approved or if we need more information.
      </p>
      <p className="mt-2 text-slate-400">
        In the meantime, you can browse the{' '}
        <a href="/explore" className="text-amber-400 hover:underline">
          Explore feed
        </a>{' '}
        for community posts and Q&amp;A.
      </p>
    </div>
  )
}

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'pending' | 'ok'>('loading')

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace('/auth')
        return
      }
      const { data: app } = await supabase
        .from('applications')
        .select('status')
        .eq('user_id', session.user.id)
        .eq('status', 'pending')
        .maybeSingle()
      setStatus(app ? 'pending' : 'ok')
    })
  }, [router])

  if (status === 'loading') return null
  if (status === 'pending') return <PendingReviewMessage />
  return <>{children}</>
}
