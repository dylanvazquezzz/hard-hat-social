import Image from 'next/image'
import type { Contractor } from '@/lib/types'

interface Props {
  contractor: Omit<Contractor, 'phone' | 'email'>
}

export default function ProfileHeader({ contractor }: Props) {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
      {contractor.profile_photo_url ? (
        <Image
          src={contractor.profile_photo_url}
          alt={contractor.full_name}
          width={112}
          height={112}
          className="h-24 w-24 shrink-0 rounded-xl bg-slate-800 object-cover sm:h-28 sm:w-28"
        />
      ) : (
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-3xl font-bold text-amber-500 sm:h-28 sm:w-28">
          {contractor.full_name.charAt(0)}
        </div>
      )}

      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-100 sm:text-3xl">{contractor.full_name}</h1>
          <span className="rounded-full bg-emerald-900/50 px-3 py-1 text-sm font-medium text-emerald-400">
            Verified
          </span>
        </div>
        <p className="mt-1 text-lg font-semibold text-amber-500">{contractor.trade}</p>
        <p className="mt-1 text-sm text-slate-400">
          {contractor.location_city}, {contractor.location_state} ·{' '}
          {contractor.years_experience} years experience
        </p>
        {contractor.website && (
          <a
            href={contractor.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            {contractor.website}
          </a>
        )}
      </div>
    </div>
  )
}
