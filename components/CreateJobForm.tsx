'use client'

import { useState } from 'react'
import { createJob } from '@/app/jobs/actions'

const TRADES = ['Welding', 'HVAC', 'Electrical', 'Plumbing', 'General Contractor', 'Drywall', 'Other']

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
]

interface CreateJobFormProps {
  gcContractorId: string
  defaultOpen?: boolean
}

export default function CreateJobForm({ gcContractorId, defaultOpen = false }: CreateJobFormProps) {
  const [open, setOpen] = useState(defaultOpen)
  const [title, setTitle] = useState('')
  const [trade, setTrade] = useState('')
  const [payRate, setPayRate] = useState('')
  const [locationCity, setLocationCity] = useState('')
  const [locationState, setLocationState] = useState('')
  const [duration, setDuration] = useState('')
  const [description, setDescription] = useState('')
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPosting(true)
    setError(null)
    setSuccess(false)
    try {
      await createJob({
        gc_contractor_id: gcContractorId,
        title: title.trim(),
        description: description.trim(),
        trade: trade.trim(),
        pay_rate: payRate.trim() || null,
        duration: duration.trim() || null,
        location_city: locationCity.trim() || null,
        location_state: locationState.trim() || null,
      })
      // Reset form
      setTitle('')
      setTrade('')
      setPayRate('')
      setLocationCity('')
      setLocationState('')
      setDuration('')
      setDescription('')
      setSuccess(true)
      setTimeout(() => {
        setOpen(false)
        setSuccess(false)
      }, 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post job')
    } finally {
      setPosting(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-lg border border-dashed border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-amber-400 hover:border-amber-500 hover:bg-slate-800 transition-colors"
      >
        + Post a Job
      </button>
    )
  }

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 p-5">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-100">Post a Job</h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
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
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Trade */}
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">
            Trade Needed <span className="text-red-400">*</span>
          </label>
          <select
            value={trade}
            onChange={(e) => setTrade(e.target.value)}
            required
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="">Select a trade…</option>
            {TRADES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Pay Rate + Duration row */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-400">Pay Rate</label>
            <input
              type="text"
              value={payRate}
              onChange={(e) => setPayRate(e.target.value)}
              maxLength={60}
              placeholder="e.g. $45/hr, $800/day, Negotiable"
              className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-400">Duration</label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              maxLength={60}
              placeholder="e.g. 2 weeks, 3 months, Ongoing"
              className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Location row */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-400">City</label>
            <input
              type="text"
              value={locationCity}
              onChange={(e) => setLocationCity(e.target.value)}
              placeholder="Houston"
              className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <div className="w-28">
            <label className="mb-1 block text-xs font-medium text-slate-400">State</label>
            <select
              value={locationState}
              onChange={(e) => setLocationState(e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="">—</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
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
            placeholder="Describe the work, qualifications needed, site details, start date…"
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
          />
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}
        {success && <p className="text-xs text-emerald-400">Job posted!</p>}

        <button
          type="submit"
          disabled={posting}
          className="w-full rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400 transition-colors disabled:opacity-50"
        >
          {posting ? 'Posting…' : 'Post Job'}
        </button>
      </form>
    </div>
  )
}
