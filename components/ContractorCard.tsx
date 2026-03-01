import Image from 'next/image'
import Link from 'next/link'
import type { Contractor } from '@/lib/types'

interface Props {
  contractor: Contractor
}

export default function ContractorCard({ contractor }: Props) {
  return (
    <Link
      href={`/contractors/${contractor.id}`}
      className="block rounded-lg border border-slate-800 bg-slate-900 p-5 hover:border-slate-700 transition-colors"
    >
      <div className="flex items-start gap-4">
        {contractor.profile_photo_url ? (
          <Image
            src={contractor.profile_photo_url}
            alt={contractor.full_name}
            width={48}
            height={48}
            className="h-12 w-12 shrink-0 rounded-full bg-slate-700 object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-800 text-lg font-bold text-amber-500">
            {contractor.full_name.charAt(0)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate font-semibold text-slate-100">{contractor.full_name}</h3>
            <span className="shrink-0 rounded-full bg-emerald-900/50 px-2 py-0.5 text-xs text-emerald-400">
              Verified
            </span>
          </div>
          <p className="text-sm font-medium text-amber-400">{contractor.trade}</p>
          <p className="mt-1 text-xs text-slate-500">
            {contractor.location_city}, {contractor.location_state} ·{' '}
            {contractor.years_experience} yrs
          </p>
          {contractor.specialties?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {contractor.specialties.slice(0, 3).map((s) => (
                <span key={s} className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
                  {s}
                </span>
              ))}
              {contractor.specialties.length > 3 && (
                <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-500">
                  +{contractor.specialties.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
