'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import JobCard from '@/components/JobCard'
import CreateJobForm from '@/components/CreateJobForm'
import type { Job } from '@/lib/types'

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [viewerContractorId, setViewerContractorId] = useState<string | null>(null)
  const [viewerIsGC, setViewerIsGC] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        const { data: contractor } = await supabase
          .from('contractors')
          .select('id, trade')
          .eq('user_id', session.user.id)
          .eq('status', 'approved')
          .maybeSingle()

        if (contractor) {
          setViewerContractorId(contractor.id)
          setViewerIsGC(contractor.trade === 'General Contractor')
        }
      }

      const { data: jobsData } = await supabase
        .from('jobs')
        .select(`
          id, title, description, trade, location_city, location_state,
          status, created_at, hired_at, completed_at, gc_contractor_id, hired_contractor_id,
          gc_contractor:contractors!jobs_gc_contractor_id_fkey(full_name, trade),
          hired_contractor:contractors!jobs_hired_contractor_id_fkey(full_name, trade)
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      setJobs((jobsData as unknown as Job[]) ?? [])
      setLoading(false)
    }

    load()
  }, [])

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

      {loading ? (
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 px-5 py-8 text-center">
          <p className="text-sm text-slate-400">Loading...</p>
        </div>
      ) : jobs.length === 0 ? (
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
