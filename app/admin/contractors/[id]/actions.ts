'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function addCertification(contractorId: string, formData: FormData) {
  const admin = getSupabaseAdmin()

  const name = formData.get('name') as string
  const issuing_body = formData.get('issuing_body') as string
  const cert_number = (formData.get('cert_number') as string) || null
  const expiry_date = (formData.get('expiry_date') as string) || null
  const verified = formData.get('verified') === 'on'

  await admin.from('certifications').insert([
    {
      contractor_id: contractorId,
      name,
      issuing_body,
      cert_number,
      expiry_date,
      verified,
    },
  ])

  revalidatePath(`/admin/contractors/${contractorId}`)
  revalidatePath(`/contractors/${contractorId}`)
}

export async function deleteCertification(certId: string, contractorId: string) {
  const admin = getSupabaseAdmin()

  await admin.from('certifications').delete().eq('id', certId)

  revalidatePath(`/admin/contractors/${contractorId}`)
  revalidatePath(`/contractors/${contractorId}`)
}
