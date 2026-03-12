'use client'

import { useEffect, useState } from 'react'
import type { Contractor } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { markHired } from '@/app/jobs/actions'

interface SubSelectorModalProps {
  jobId: string
  onClose: () => void
}

interface RecentContact {
  id: string
  full_name: string
  trade: string
  location_city: string | null
  location_state: string | null
}

export default function SubSelectorModal({ jobId, onClose }: SubSelectorModalProps) {
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [recentContacts, setRecentContacts] = useState<RecentContact[]>([])
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      // Get current user's contractor record (to know which GC is acting)
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: gcContractor } = await supabase
          .from('contractors')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('status', 'approved')
          .maybeSingle()

        if (gcContractor) {
          // Query up to 5 distinct recently hired contractors for this GC.
          // We use hired_at DESC and deduplicate in JS since PostgREST
          // doesn't support DISTINCT ON.
          const { data: recentJobs } = await supabase
            .from('jobs')
            .select('hired_contractor_id, hired_at')
            .eq('gc_contractor_id', gcContractor.id)
            .not('hired_contractor_id', 'is', null)
            .order('hired_at', { ascending: false })
            .limit(20) // over-fetch to allow dedup down to 5 distinct

          if (recentJobs && recentJobs.length > 0) {
            // Deduplicate by hired_contractor_id — keep most-recent hire per contractor
            const seen = new Set<string>()
            const distinctIds: string[] = []
            for (const job of recentJobs) {
              if (job.hired_contractor_id && !seen.has(job.hired_contractor_id)) {
                seen.add(job.hired_contractor_id)
                distinctIds.push(job.hired_contractor_id)
                if (distinctIds.length === 5) break
              }
            }

            if (distinctIds.length > 0) {
              const { data: recentData } = await supabase
                .from('contractors')
                .select('id, full_name, trade, location_city, location_state')
                .in('id', distinctIds)
                .eq('status', 'approved')

              if (recentData && recentData.length > 0) {
                // Re-sort to match the hired_at order (Supabase IN doesn't preserve order)
                const byId = new Map(recentData.map((c) => [c.id, c]))
                const ordered = distinctIds
                  .map((id) => byId.get(id))
                  .filter((c): c is RecentContact => c !== undefined)
                setRecentContacts(ordered)
              }
            }
          }
        }
      }

      // Load all approved contractors for search
      const { data } = await supabase
        .from('contractors')
        .select('id, full_name, trade, location_city, location_state')
        .eq('status', 'approved')
        .order('full_name')
      setContractors((data as Contractor[]) ?? [])
    }

    load()
  }, [])

  const filtered = contractors.filter(
    (c) =>
      search === '' ||
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      c.trade.toLowerCase().includes(search.toLowerCase())
  )

  async function handleConfirm() {
    if (!selectedId) return
    setSubmitting(true)
    setError(null)
    try {
      await markHired(jobId, selectedId)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to hire contractor')
      setSubmitting(false)
    }
  }

  function ContractorButton({ c }: { c: RecentContact | Contractor }) {
    return (
      <button
        key={c.id}
        onClick={() => setSelectedId(c.id)}
        className={`w-full text-left rounded-md border px-3 py-2.5 transition-colors ${
          selectedId === c.id
            ? 'border-amber-500 bg-amber-500/10'
            : 'border-slate-700 bg-slate-800 hover:border-slate-600'
        }`}
      >
        <p className="text-sm font-semibold text-slate-100">{c.full_name}</p>
        <p className="text-xs text-slate-400">
          {c.trade}
          {(c.location_city || c.location_state) && (
            <> &middot; {[c.location_city, c.location_state].filter(Boolean).join(', ')}</>
          )}
        </p>
      </button>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="max-w-md w-full mx-4 bg-slate-900 border border-slate-700 rounded-lg p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-bold text-slate-100 mb-4">Select a Contractor to Hire</h2>

        {/* Recent Contacts — only shown when there is hire history */}
        {recentContacts.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Recent Contacts
            </p>
            <div className="space-y-2">
              {recentContacts.map((c) => (
                <ContractorButton key={c.id} c={c} />
              ))}
            </div>
            <div className="mt-4 mb-3 border-t border-slate-800" />
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              All Contractors
            </p>
          </div>
        )}

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or trade"
          className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 mb-3"
        />

        <div className="max-h-60 overflow-y-auto space-y-2">
          {filtered.length === 0 && (
            <p className="text-sm text-slate-500 py-4 text-center">No contractors found.</p>
          )}
          {filtered.map((c) => (
            <ContractorButton key={c.id} c={c} />
          ))}
        </div>

        {error && (
          <p className="mt-3 text-xs text-red-400">{error}</p>
        )}

        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-md border border-slate-700 px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedId || submitting}
            className="rounded-md bg-amber-500 px-3 py-1.5 text-sm font-semibold text-slate-950 hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Hiring...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}
