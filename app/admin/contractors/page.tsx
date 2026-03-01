import { getSupabaseAdmin } from '@/lib/supabase-admin'
import type { Contractor } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function AdminContractorsPage() {
  const admin = getSupabaseAdmin()
  const { data } = await admin
    .from('contractors')
    .select('id, full_name, trade, location_city, location_state, status, created_at')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  const contractors = (data ?? []) as Contractor[]

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Approved Contractors</h1>
          <p className="mt-1 text-slate-400">
            {contractors.length} contractor{contractors.length !== 1 ? 's' : ''}
          </p>
        </div>
        <a
          href="/admin"
          className="text-sm text-slate-400 hover:text-slate-300"
        >
          ← Back to queue
        </a>
      </div>

      {contractors.length === 0 ? (
        <div className="flex items-center justify-center rounded-lg border border-slate-800 bg-slate-900 py-24">
          <p className="text-slate-400">No approved contractors yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contractors.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 px-5 py-4"
            >
              <div>
                <p className="font-medium text-slate-100">{c.full_name}</p>
                <p className="text-sm text-slate-400">
                  {c.trade} · {c.location_city}, {c.location_state}
                </p>
              </div>
              <a
                href={`/admin/contractors/${c.id}`}
                className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-amber-500 hover:text-amber-400 transition-colors"
              >
                Manage Certs
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
