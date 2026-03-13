'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function createComment(
  postId: string,
  content: string
): Promise<{ error?: string }> {
  // Validate content first
  if (!content.trim()) {
    return { error: 'Content required' }
  }

  // Extract auth token from cookies (same pattern as lib/admin-guard.ts)
  const cookieStore = cookies()
  const allCookies = cookieStore.getAll()
  const tokenCookie = allCookies.find(
    (c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
  )

  let accessToken: string | null = null
  if (tokenCookie?.value) {
    try {
      const parsed = JSON.parse(tokenCookie.value)
      accessToken = Array.isArray(parsed) ? parsed[0] : parsed?.access_token ?? null
    } catch {
      // token parse failed — treat as unauthenticated
    }
  }

  if (!accessToken) {
    return { error: 'Unauthorized' }
  }

  const admin = getSupabaseAdmin()
  const { data: userData } = await admin.auth.getUser(accessToken)
  const user = userData?.user

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Insert comment into DB
  const { error: insertError } = await admin
    .from('comments')
    .insert({ post_id: postId, user_id: user.id, content: content.trim() })

  if (insertError) {
    console.error('[createComment] error:', insertError.message)
    return { error: 'Insert failed' }
  }

  // TODO S03: call createNotification(user.id, post.user_id, 'comment', newComment.id)

  revalidatePath('/explore')

  return {}
}
