'use client'

import { useEffect, useState } from 'react'
import type { Contractor } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { markHired } from '@/app/jobs/actions'

interface SubSelectorModalProps {
  jobId: string
  onClose: () => void
}

export default function SubSelectorModal({ jobId, onClose }: SubSelectorModalProps) {
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('contractors')
      .select('id, full_name, trade, location_city, location_state')
      .eq('status', 'approved')
      .order('full_name')
      .then(({ data }) => setContractors((data as Contractor[]) ?? []))
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

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or trade"
          className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 mb-3"
        />

        <div className="max-h-72 overflow-y-auto space-y-2">
          {filtered.length === 0 && (
            <p className="text-sm text-slate-500 py-4 text-center">No contractors found.</p>
          )}
          {filtered.map((c) => (
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
