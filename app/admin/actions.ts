'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { sendApprovalEmail, sendRejectionEmail } from '@/lib/email'
import { assertIsAdmin } from '@/lib/admin-guard'
import type { Application } from '@/lib/types'

export async function approveApplication(applicationId: string) {
  await assertIsAdmin()
  const admin = getSupabaseAdmin()

  const { data: app } = await admin
    .from('applications')
    .select('*')
    .eq('id', applicationId)
    .single()

  if (!app) return

  const application = app as Application

  // Resolve user_id: use stored value or look up by email
  let userId = application.user_id ?? null
  if (!userId) {
    const { data: listData } = await admin.auth.admin.listUsers()
    const match = listData?.users?.find((u) => u.email === application.email)
    if (match) userId = match.id
  }

  // Insert contractor — capture ID for cert records
  const { data: newContractorData } = await admin
    .from('contractors')
    .insert([
      {
        user_id: userId,
        full_name: application.full_name,
        trade: application.trade,
        specialties: application.specialties,
        location_city: application.location_city,
        location_state: application.location_state,
        years_experience: application.years_experience,
        bio: application.bio,
        phone: application.phone,
        email: application.email,
        website: application.website,
        status: 'approved',
      },
    ])
    .select('id')
    .single()

  // Auto-create certification records from uploaded application documents
  if (newContractorData && application.document_urls && application.document_urls.length > 0) {
    const certRecords = application.document_urls.map((docUrl: string) => ({
      contractor_id: newContractorData.id,
      name: `${application.trade} Credential`,
      issuing_body: 'Submitted via Application',
      verified: true,
      document_url: docUrl,
    }))
    await admin.from('certifications').insert(certRecords)
  }

  // Upsert a profile row so the user has a username
  if (userId) {
    const username = application.email.split('@')[0]
    await admin.from('profiles').upsert(
      { id: userId, username, updated_at: new Date().toISOString() },
      { onConflict: 'id' }
    )
    // Link user_id back to the application if it wasn't set
    if (!application.user_id) {
      await admin.from('applications').update({ user_id: userId }).eq('id', applicationId)
    }
  }

  await admin.from('applications').update({ status: 'approved' }).eq('id', applicationId)

  // Send approval email (non-blocking — don't fail the action if email fails)
  sendApprovalEmail(application.email, application.full_name).catch((err) =>
    console.error('[email] approval send failed:', err)
  )

  revalidatePath('/admin')
  revalidatePath('/contractors')
  revalidatePath('/')
}

export async function rejectApplication(applicationId: string) {
  await assertIsAdmin()
  const admin = getSupabaseAdmin()

  const { data: app } = await admin
    .from('applications')
    .select('email, full_name')
    .eq('id', applicationId)
    .single()

  await admin.from('applications').update({ status: 'rejected' }).eq('id', applicationId)

  if (app) {
    sendRejectionEmail(app.email, app.full_name).catch((err) =>
      console.error('[email] rejection send failed:', err)
    )
  }

  revalidatePath('/admin')
  revalidatePath('/contractors')
  revalidatePath('/')
}
