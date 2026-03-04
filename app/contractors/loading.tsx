function SkeletonCard() {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-5 animate-pulse">
      <div className="flex items-start gap-4">
        {/* Avatar placeholder */}
        <div className="h-12 w-12 shrink-0 rounded-full bg-slate-800" />

        <div className="min-w-0 flex-1">
          {/* Name + badge row */}
          <div className="flex items-center justify-between gap-2">
            <div className="h-4 w-32 rounded bg-slate-800" />
            <div className="h-4 w-14 rounded-full bg-slate-800" />
          </div>

          {/* Trade line */}
          <div className="h-3 w-20 rounded bg-slate-800 mt-1" />

          {/* Location line */}
          <div className="h-3 w-36 rounded bg-slate-800 mt-1" />

          {/* Specialty tag placeholders */}
          <div className="mt-2 flex gap-1">
            <div className="h-4 w-16 rounded bg-slate-800" />
            <div className="h-4 w-12 rounded bg-slate-800" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ContractorsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page header skeleton */}
      <div className="mb-8">
        <div className="h-9 w-56 rounded bg-slate-800 animate-pulse" />
        <div className="h-4 w-40 rounded bg-slate-800 animate-pulse mt-2" />
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar placeholder — reserves space, no skeleton shown */}
        <div className="w-full shrink-0 lg:w-56" />

        {/* Card grid */}
        <div className="flex-1">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
