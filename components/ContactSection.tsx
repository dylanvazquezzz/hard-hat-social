'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface ContactSectionProps {
  contractorId: string
}

type ContactInfo = { phone: string; email: string }

export default function ContactSection({ contractorId }: ContactSectionProps) {
  const [status, setStatus] = useState<'loading' | 'approved' | 'unauthenticated' | 'not_approved'>('loading')
  const [contact, setContact] = useState<ContactInfo | null>(null)

  useEffect(() => {
    async function check() {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        setStatus('unauthenticated')
        return
      }

      const res = await fetch(`/api/contact/${contractorId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setContact(data as ContactInfo)
        setStatus('approved')
      } else if (res.status === 403) {
        setStatus('not_approved')
      } else if (res.status === 401) {
        setStatus('unauthenticated')
      } else {
        setStatus('not_approved')
      }
    }
    check()
  }, [contractorId])

  if (status === 'loading') {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
        <div className="h-4 w-24 animate-pulse rounded bg-slate-800" />
      </div>
    )
  }

  if (status === 'approved' && contact) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Contact
        </h3>
        <dl className="space-y-3">
          {contact.phone && (
            <div>
              <dt className="text-xs text-slate-500">Phone</dt>
              <dd className="mt-0.5 font-medium text-slate-100">{contact.phone}</dd>
            </div>
          )}
          {contact.email && (
            <div>
              <dt className="text-xs text-slate-500">Email</dt>
              <dd className="mt-0.5 font-medium text-slate-100">{contact.email}</dd>
            </div>
          )}
        </dl>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-6">
      <h3 className="mb-2 text-sm font-semibold text-amber-400">Contact Info</h3>
      <p className="mb-4 text-xs text-slate-400">
        {status === 'unauthenticated'
          ? 'Sign in as a verified contractor to view contact details.'
          : 'Only approved contractors can view contact details.'}
      </p>
      <a
        href="/auth"
        className="block w-full rounded-md bg-amber-500 px-4 py-2 text-center text-sm font-semibold text-slate-950 hover:bg-amber-400 transition-colors"
      >
        Sign In to Contact
      </a>
    </div>
  )
}
