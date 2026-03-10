import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import JobCard from '@/components/JobCard'
import CreateJobForm from '@/components/CreateJobForm'
import type { Job } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function JobsPage() {
  const admin = getSupabaseAdmin()

  // Determine viewer identity using cookie auth pattern
  const cookieStore = cookies()
  const allCookies = cookieStore.getAll()
  const authCookie = allCookies.find((c) => c.name.includes('-auth-token'))
  const token = authCookie
    ? (() => {
        try {
          return JSON.parse(authCookie.value)?.[0]
        } catch {
          return null
        }
      })()
    : null
  const {
    data: { user },
  } = await admin.auth.getUser(token ?? '')

  let viewerContractorId: string | null = null
  let viewerIsGC = false

  if (user) {
    const { data: viewerContractor } = await admin
      .from('contractors')
      .select('id, trade')
      .eq('user_id', user.id)
      .eq('status', 'approved')
      .maybeSingle()
    viewerContractorId = viewerContractor?.id ?? null
    viewerIsGC = viewerContractor?.trade === 'General Contractor'
  }

  // Fetch jobs with dual FK hint syntax (required — two FKs to contractors table)
  const { data: jobsData } = await admin
    .from('jobs')
    .select(`
      id, title, description, trade, location_city, location_state,
      status, created_at, hired_at, completed_at, gc_contractor_id, hired_contractor_id,
      gc_contractor:contractors!jobs_gc_contractor_id_fkey(full_name, trade),
      hired_contractor:contractors!jobs_hired_contractor_id_fkey(full_name, trade)
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  const jobs = (jobsData as unknown as Job[]) ?? []

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100">Jobs Board</h1>
        <p className="mt-1 text-slate-400">
          Subcontracting opportunities posted by verified General Contractors
        </p>
      </div>

      {viewerIsGC && viewerContractorId && (
        <CreateJobForm gcContractorId={viewerContractorId} />
      )}

      {jobs.length === 0 ? (
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 px-5 py-8 text-center">
          <p className="text-sm text-slate-400">
            No jobs posted yet. GCs can post subcontracting opportunities here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isOwner={job.gc_contractor_id === viewerContractorId}
            />
          ))}
        </div>
      )}
    </div>
  )
}
