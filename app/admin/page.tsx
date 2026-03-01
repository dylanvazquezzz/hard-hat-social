import type { Application } from '@/lib/types'
import { approveApplication, rejectApplication } from './actions'

export const dynamic = 'force-dynamic'

async function getPendingApplications(): Promise<Application[]> {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/applications?status=eq.pending&order=submitted_at.asc&select=*`
  const res = await fetch(url, {
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
    },
    cache: 'no-store',
  })
  if (!res.ok) {
    console.error('[admin] fetch error:', res.status, await res.text())
    return []
  }
  return res.json()
}

export default async function AdminPage() {
  const pending = await getPendingApplications()
  console.log('[admin] rows:', pending.length)

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Admin Queue</h1>
          <p className="mt-1 text-slate-400">
            {pending.length} pending application{pending.length !== 1 ? 's' : ''}
          </p>
        </div>
        <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-sm text-amber-400">
          Admin only
        </span>
      </div>

      {pending.length === 0 ? (
        <div className="flex items-center justify-center rounded-lg border border-slate-800 bg-slate-900 py-24">
          <p className="text-slate-400">No pending applications. All caught up.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((app) => (
            <div key={app.id} className="rounded-lg border border-slate-800 bg-slate-900 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-slate-100">{app.full_name}</h2>
                    <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-400">
                      {app.trade}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">
                    {app.location_city}, {app.location_state} · {app.years_experience} yrs
                    experience
                  </p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {app.email} · {app.phone}
                  </p>
                  {app.website && (
                    <p className="mt-0.5 text-sm text-slate-600">{app.website}</p>
                  )}
                  {app.specialties?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {app.specialties.map((s) => (
                        <span
                          key={s}
                          className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-400"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  {app.bio && (
                    <p className="mt-3 line-clamp-2 text-sm text-slate-400">{app.bio}</p>
                  )}
                  {app.document_urls?.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <p className="text-xs font-medium text-slate-500">Documents</p>
                      {app.document_urls.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-xs text-amber-400 hover:text-amber-300 underline truncate"
                        >
                          Document {i + 1}
                        </a>
                      ))}
                    </div>
                  )}
                  <p className="mt-3 text-xs text-slate-600">
                    Submitted {new Date(app.submitted_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex shrink-0 gap-3 sm:flex-col">
                  <form
                    action={async () => {
                      'use server'
                      await approveApplication(app.id)
                    }}
                  >
                    <button
                      type="submit"
                      className="w-full rounded-md bg-emerald-700 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors"
                    >
                      Approve
                    </button>
                  </form>
                  <form
                    action={async () => {
                      'use server'
                      await rejectApplication(app.id)
                    }}
                  >
                    <button
                      type="submit"
                      className="w-full rounded-md border border-red-800 bg-red-900/20 px-5 py-2 text-sm font-semibold text-red-400 hover:bg-red-900/40 transition-colors"
                    >
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
