function SkeletonPostCard() {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-5 animate-pulse">
      {/* Author row */}
      <div className="flex items-center gap-3 mb-3">
        <div className="h-8 w-8 rounded-full bg-slate-800 shrink-0" />
        <div className="h-3 w-24 rounded bg-slate-800" />
      </div>
      {/* Content lines */}
      <div className="h-4 w-full rounded bg-slate-800 mt-2" />
      <div className="h-3 w-3/4 rounded bg-slate-800 mt-1" />
    </div>
  )
}

export default function ExploreLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonPostCard key={i} />
        ))}
      </div>
    </div>
  )
}
