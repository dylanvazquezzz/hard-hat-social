'use client'

import { useState } from 'react'
import { createJob } from '@/app/jobs/actions'

interface CreateJobFormProps {
  gcContractorId: string
}

export default function CreateJobForm({ gcContractorId }: CreateJobFormProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [trade, setTrade] = useState('')
  const [locationCity, setLocationCity] = useState('')
  const [locationState, setLocationState] = useState('')
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPosting(true)
    setError(null)
    try {
      await createJob({
        gc_contractor_id: gcContractorId,
        title: title.trim(),
        description: description.trim(),
        trade: trade.trim(),
        location_city: locationCity.trim() || null,
        location_state: locationState.trim() || null,
      })
      // Reset form on success
      setTitle('')
      setDescription('')
      setTrade('')
      setLocationCity('')
      setLocationState('')
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post job')
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className="mb-6">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full rounded-lg border border-dashed border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-amber-400 hover:border-amber-500 hover:bg-slate-800 transition-colors"
        >
          + Post a Job
        </button>
      ) : (
      <div className="rounded-lg border border-slate-700 bg-slate-900 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-100">Post a Job</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-slate-500 hover:text-slate-300 text-sm"
          >
            Cancel
          </button>
        </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">
            Job Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            required
            placeholder="e.g. Certified TIG Welder needed — 6-week structural job"
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">
            Description <span className="text-red-400">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={1000}
            required
            rows={4}
            placeholder="Describe the work, qualifications needed, timeline, pay rate..."
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-500 focus:outline-none resize-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">
            Trade Needed <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={trade}
            onChange={(e) => setTrade(e.target.value)}
            required
            placeholder="e.g. Welding, HVAC, Electrical, Plumbing"
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-400">City</label>
            <input
              type="text"
              value={locationCity}
              onChange={(e) => setLocationCity(e.target.value)}
              placeholder="Houston"
              className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div className="w-20">
            <label className="mb-1 block text-xs font-medium text-slate-400">State</label>
            <input
              type="text"
              value={locationState}
              onChange={(e) => setLocationState(e.target.value)}
              maxLength={2}
              placeholder="TX"
              className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-500 focus:outline-none uppercase"
            />
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={posting}
          className="w-full rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400 transition-colors disabled:opacity-50"
        >
          {posting ? 'Posting...' : 'Post Job'}
        </button>
      </form>
      </div>
      )}
    </div>
  )
}
