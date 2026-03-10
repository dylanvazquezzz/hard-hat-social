interface CompletedJob {
  id: string
  title: string
  trade: string
  location_city: string | null
  location_state: string | null
  completed_at: string | null
  gc_contractor?: { full_name: string } | null
}

interface CompletedJobsSectionProps {
  jobs: CompletedJob[]
}

export default function CompletedJobsSection({ jobs }: CompletedJobsSectionProps) {
  if (jobs.length === 0) return null

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        Verified Work History
      </h2>
      <p className="text-xs text-slate-500 mb-4">Platform-verified completed jobs</p>

      <div>
        {jobs.map((job) => (
          <div
            key={job.id}
            className="border-t border-slate-800 py-3 first:border-t-0 first:pt-0"
          >
            <p className="font-semibold text-slate-100 text-sm">{job.title}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Hired by {job.gc_contractor?.full_name ?? 'Unknown'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {job.trade}
              {job.location_city ? ` · ${job.location_city}, ${job.location_state}` : ''} · Completed{' '}
              {job.completed_at
                ? new Date(job.completed_at).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                  })
                : 'recently'}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
