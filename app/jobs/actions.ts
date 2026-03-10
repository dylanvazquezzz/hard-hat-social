'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

interface CreateJobData {
  gc_contractor_id: string
  title: string
  description: string
  trade: string
  location_city: string | null
  location_state: string | null
}

export async function createJob(data: CreateJobData) {
  const admin = getSupabaseAdmin()
  const { error } = await admin.from('jobs').insert({
    ...data,
    status: 'open',
  })
  if (error) throw new Error(error.message)
  revalidatePath('/jobs')
}

export async function markHired(jobId: string, hiredContractorId: string) {
  const admin = getSupabaseAdmin()
  const { error } = await admin
    .from('jobs')
    .update({
      status: 'hired',
      hired_contractor_id: hiredContractorId,
      hired_at: new Date().toISOString(),
    })
    .eq('id', jobId)
  if (error) throw new Error(error.message)
  revalidatePath('/jobs')
}

export async function markCompleted(jobId: string, hiredContractorId: string) {
  const admin = getSupabaseAdmin()
  const { error } = await admin
    .from('jobs')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', jobId)
  if (error) throw new Error(error.message)
  revalidatePath('/jobs')
  revalidatePath(`/contractors/${hiredContractorId}`)
}
