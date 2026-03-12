'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState, useEffect } from 'react'

const TRADES = ['Welding', 'HVAC', 'Electrical', 'Plumbing', 'General Contractor']

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
]

const CERT_OPTIONS = [
  'AWS Certified Welder',
  'State Contractor License',
  'EPA 608',
  'State Electrician License',
  'State Plumber License',
  'D1.1 Structural Certification',
  'D1.5 Bridge Welding Certification',
]

interface Props {
  currentTrade?: string
  currentState?: string
  currentQuery?: string
  currentInsurance?: string   // 'gl' | 'wc' | '' — general liability or workers comp
  currentCert?: string        // cert name from CERT_OPTIONS
}

export default function SearchFilters({
  currentTrade,
  currentState,
  currentQuery,
  currentInsurance,
  currentCert,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchInput, setSearchInput] = useState(currentQuery ?? '')

  useEffect(() => {
    setSearchInput(currentQuery ?? '')
  }, [currentQuery])

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`/contractors?${params.toString()}`)
    },
    [router, searchParams]
  )

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    updateFilter('q', searchInput.trim())
  }

  const hasFilters =
    !!currentTrade ||
    !!currentState ||
    !!currentQuery ||
    !!currentInsurance ||
    !!currentCert

  return (
    <div className="space-y-6">
      {/* Text search */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Search</p>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Name, trade, specialty…"
            className="flex-1 min-w-0 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <button
            type="submit"
            className="rounded-md bg-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-600 transition-colors"
          >
            Go
          </button>
        </form>
      </div>

      {/* Trade filter */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Trade</p>
        <div className="space-y-0.5">
          <button
            onClick={() => updateFilter('trade', '')}
            className={`block w-full rounded px-3 py-2 text-left text-sm transition-colors ${
              !currentTrade
                ? 'bg-amber-500/10 font-medium text-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Trades
          </button>
          {TRADES.map((trade) => (
            <button
              key={trade}
              onClick={() => updateFilter('trade', trade)}
              className={`block w-full rounded px-3 py-2 text-left text-sm transition-colors ${
                currentTrade === trade
                  ? 'bg-amber-500/10 font-medium text-amber-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {trade}
            </button>
          ))}
        </div>
      </div>

      {/* State filter */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">State</p>
        <select
          value={currentState ?? ''}
          onChange={(e) => updateFilter('state', e.target.value)}
          className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
        >
          <option value="">All States</option>
          {US_STATES.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </div>

      {/* Insurance filter */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Insurance</p>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={currentInsurance === 'gl'}
              onChange={(e) => updateFilter('insurance', e.target.checked ? 'gl' : '')}
              className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-900"
            />
            <span className={`text-sm transition-colors ${
              currentInsurance === 'gl' ? 'text-amber-400 font-medium' : 'text-slate-400 group-hover:text-slate-200'
            }`}>
              General Liability
            </span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={currentInsurance === 'wc'}
              onChange={(e) => updateFilter('insurance', e.target.checked ? 'wc' : '')}
              className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-900"
            />
            <span className={`text-sm transition-colors ${
              currentInsurance === 'wc' ? 'text-amber-400 font-medium' : 'text-slate-400 group-hover:text-slate-200'
            }`}>
              Workers&apos; Comp
            </span>
          </label>
        </div>
      </div>

      {/* Certification filter */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Certification</p>
        <select
          value={currentCert ?? ''}
          onChange={(e) => updateFilter('cert', e.target.value)}
          className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
        >
          <option value="">Any Certification</option>
          {CERT_OPTIONS.map((cert) => (
            <option key={cert} value={cert}>
              {cert}
            </option>
          ))}
        </select>
      </div>

      {hasFilters && (
        <button
          onClick={() => {
            setSearchInput('')
            router.push('/contractors')
          }}
          className="w-full rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          Clear Filters
        </button>
      )}
    </div>
  )
}
