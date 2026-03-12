'use server'

import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function checkApplyRateLimit(
  email: string
): Promise<{ allowed: boolean; error?: string }> {
  const admin = getSupabaseAdmin()
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { count, error } = await admin
    .from('applications')
    .select('id', { count: 'exact', head: true })
    .eq('email', email)
    .gte('submitted_at', cutoff)
  if (error) {
    // Log but don't block — if the rate check fails, allow submission to proceed
    console.error('[apply] rate limit check failed:', error.message)
    return { allowed: true }
  }
  if ((count ?? 0) >= 3) {
    return {
      allowed: false,
      error:
        'You have submitted 3 applications in the last 24 hours. Please wait before submitting again.',
    }
  }
  return { allowed: true }
}
