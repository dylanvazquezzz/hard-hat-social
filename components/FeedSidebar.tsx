import Image from 'next/image'

interface SidebarContractor {
  id: string
  full_name: string
  trade: string
  profile_photo_url: string | null
}

interface FeedSidebarProps {
  recentlyVerified: SidebarContractor[]
  suggestedPeople: SidebarContractor[]
}

function SidebarEntry({ contractor }: { contractor: SidebarContractor }) {
  return (
    <a
      href={`/contractors/${contractor.id}`}
      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
    >
      <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full">
        {contractor.profile_photo_url ? (
          <Image
            src={contractor.profile_photo_url}
            alt={contractor.full_name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-700 text-xs font-bold text-amber-500">
            {contractor.full_name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-slate-100">{contractor.full_name}</p>
        <p className="truncate text-xs text-slate-400">{contractor.trade}</p>
      </div>
    </a>
  )
}

function SidebarWidget({
  title,
  contractors,
}: {
  title: string
  contractors: SidebarContractor[]
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 mb-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
        {title}
      </p>
      <div className="space-y-3">
        {contractors.map((c) => (
          <SidebarEntry key={c.id} contractor={c} />
        ))}
        {contractors.length === 0 && (
          <p className="text-xs text-slate-500">No contractors yet.</p>
        )}
      </div>
      <a
        href="/contractors"
        className="mt-3 block text-xs text-amber-500 hover:underline"
      >
        View all &rarr;
      </a>
    </div>
  )
}

export default function FeedSidebar({ recentlyVerified, suggestedPeople }: FeedSidebarProps) {
  return (
    <>
      <SidebarWidget title="Recently Verified" contractors={recentlyVerified} />
      <SidebarWidget title="Suggested People" contractors={suggestedPeople} />
    </>
  )
}
