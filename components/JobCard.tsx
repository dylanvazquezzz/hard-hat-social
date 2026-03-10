'use client'

import { useState } from 'react'
import type { Job, JobStatus } from '@/lib/types'
import { markCompleted } from '@/app/jobs/actions'
import SubSelectorModal from '@/components/SubSelectorModal'

interface JobCardProps {
  job: Job
  isOwner: boolean
}

const statusConfig: Record<JobStatus, { label: string; className: string }> = {
  open:      { label: 'Open',      className: 'bg-emerald-900/50 text-emerald-400' },
  hired:     { label: 'Hired',     className: 'bg-amber-900/40 text-amber-400' },
  completed: { label: 'Completed', className: 'bg-slate-800 text-slate-400' },
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function JobCard({ job, isOwner }: JobCardProps) {
  const [showModal, setShowModal] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const status = statusConfig[job.status]
  const location = [job.location_city, job.location_state].filter(Boolean).join(', ')

  async function handleMarkCompleted() {
    if (!job.hired_contractor_id) return
    setCompleting(true)
    setError(null)
    try {
      await markCompleted(job.id, job.hired_contractor_id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark complete')
    } finally {
      setCompleting(false)
    }
  }

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-slate-100 truncate">{job.title}</h3>
          <p className="mt-0.5 text-sm text-slate-400">
            {job.trade}
            {location ? ` · ${location}` : ''}
          </p>
          {job.gc_contractor && (
            <p className="mt-0.5 text-xs text-slate-500">
              Posted by {job.gc_contractor.full_name}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}>
            {status.label}
          </span>
          <span className="text-xs text-slate-500">{formatDate(job.created_at)}</span>
        </div>
      </div>

      {job.description && (
        <p className="mt-3 text-sm text-slate-300 line-clamp-3">{job.description}</p>
      )}

      {job.status === 'hired' && job.hired_contractor && (
        <p className="mt-2 text-xs text-slate-500">
          Hired: {job.hired_contractor.full_name}
        </p>
      )}

      {error && (
        <p className="mt-2 text-xs text-red-400">{error}</p>
      )}

      {isOwner && (
        <div className="mt-4">
          {job.status === 'open' && (
            <>
              <button
                onClick={() => setShowModal(true)}
                className="rounded-md bg-amber-500 px-3 py-1.5 text-sm font-semibold text-slate-950 hover:bg-amber-400 transition-colors"
              >
                Mark Hired
              </button>
              {showModal && (
                <SubSelectorModal
                  jobId={job.id}
                  onClose={() => setShowModal(false)}
                />
              )}
            </>
          )}
          {job.status === 'hired' && (
            <button
              onClick={handleMarkCompleted}
              disabled={completing}
              className="rounded-md bg-slate-700 px-3 py-1.5 text-sm font-semibold text-slate-200 hover:bg-slate-600 transition-colors disabled:opacity-50"
            >
              {completing ? 'Completing...' : 'Mark Complete'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
