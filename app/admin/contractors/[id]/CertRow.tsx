'use client'

import { useState, useTransition } from 'react'
import { updateCertification, deleteCertification } from './actions'
import type { Certification } from '@/lib/types'

export function CertRow({ cert, contractorId }: { cert: Certification; contractorId: string }) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(cert.name)
  const [issuingBody, setIssuingBody] = useState(cert.issuing_body ?? '')
  const [certNumber, setCertNumber] = useState(cert.cert_number ?? '')
  const [expiryDate, setExpiryDate] = useState(cert.expiry_date ?? '')
  const [verified, setVerified] = useState(cert.verified)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    startTransition(async () => {
      await updateCertification(
        cert.id,
        {
          name,
          issuing_body: issuingBody,
          cert_number: certNumber || null,
          expiry_date: expiryDate || null,
          verified,
        },
        contractorId
      )
      setIsEditing(false)
    })
  }

  function handleCancel() {
    setName(cert.name)
    setIssuingBody(cert.issuing_body ?? '')
    setCertNumber(cert.cert_number ?? '')
    setExpiryDate(cert.expiry_date ?? '')
    setVerified(cert.verified)
    setIsEditing(false)
  }

  const inputClass =
    'w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500'

  if (isEditing) {
    return (
      <div className="rounded-lg border border-amber-500/30 bg-slate-900 px-4 py-4 space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-slate-400">Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">Issuing Body *</label>
            <input
              value={issuingBody}
              onChange={(e) => setIssuingBody(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">Cert Number</label>
            <input
              value={certNumber}
              onChange={(e) => setCertNumber(e.target.value)}
              placeholder="Optional"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">Expiry Date</label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`verified-${cert.id}`}
            checked={verified}
            onChange={(e) => setVerified(e.target.checked)}
            className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500"
          />
          <label htmlFor={`verified-${cert.id}`} className="text-sm text-slate-400">
            Verified
          </label>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={isPending || !name.trim()}
            className="rounded-md bg-amber-500 px-4 py-1.5 text-sm font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Saving…' : 'Save'}
          </button>
          <button
            onClick={handleCancel}
            disabled={isPending}
            className="rounded-md border border-slate-700 px-4 py-1.5 text-sm text-slate-300 hover:text-slate-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start justify-between rounded-lg border border-slate-800 bg-slate-900 px-4 py-3">
      <div>
        <p className="font-medium text-slate-100">{cert.name}</p>
        <p className="text-sm text-slate-400">{cert.issuing_body}</p>
        <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500">
          {cert.cert_number && <span>#{cert.cert_number}</span>}
          {cert.expiry_date && <span>Expires {cert.expiry_date}</span>}
          <span className={cert.verified ? 'text-emerald-500' : 'text-slate-500'}>
            {cert.verified ? 'Verified' : 'Unverified'}
          </span>
        </div>
      </div>
      <div className="ml-4 flex shrink-0 gap-3">
        <button
          onClick={() => setIsEditing(true)}
          className="text-xs text-slate-400 hover:text-slate-100 transition-colors"
        >
          Edit
        </button>
        <form action={() => deleteCertification(cert.id, contractorId)}>
          <button type="submit" className="text-xs text-red-500 hover:text-red-400">
            Remove
          </button>
        </form>
      </div>
    </div>
  )
}
