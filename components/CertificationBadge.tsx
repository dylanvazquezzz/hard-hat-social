import type { Certification } from '@/lib/types'

interface Props {
  certification: Certification
}

export default function CertificationBadge({ certification }: Props) {
  const isExpired = certification.expiry_date
    ? new Date(certification.expiry_date) < new Date()
    : false

  const isActive = certification.verified && !isExpired

  return (
    <div className="flex items-start gap-3 rounded-lg bg-slate-800 p-4">
      <div
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
          isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-500'
        }`}
      >
        {isActive ? '✓' : '○'}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-slate-200">{certification.name}</p>
          {isActive && <span className="shrink-0 text-xs text-emerald-400">Verified</span>}
          {isExpired && certification.verified && (
            <span className="shrink-0 text-xs text-red-400">Expired</span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-slate-500">{certification.issuing_body}</p>
        {certification.cert_number && (
          <p className="mt-0.5 text-xs text-slate-600">#{certification.cert_number}</p>
        )}
        {certification.expiry_date && (
          <p className={`mt-0.5 text-xs ${isExpired ? 'text-red-400' : 'text-slate-500'}`}>
            {isExpired ? 'Expired' : 'Expires'}{' '}
            {new Date(certification.expiry_date).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  )
}
