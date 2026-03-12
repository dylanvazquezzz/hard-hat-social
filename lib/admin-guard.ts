import 'server-only'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function assertIsAdmin(): Promise<void> {
  const cookieStore = cookies()
  const allCookies = cookieStore.getAll()
  const tokenCookie = allCookies.find(
    (c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
  )
  let userEmail: string | null = null
  if (tokenCookie?.value) {
    try {
      const parsed = JSON.parse(tokenCookie.value)
      const accessToken = Array.isArray(parsed) ? parsed[0] : parsed?.access_token
      if (accessToken) {
        const admin = getSupabaseAdmin()
        const { data } = await admin.auth.getUser(accessToken)
        userEmail = data?.user?.email ?? null
      }
    } catch {
      // token parse failed — treat as unauthenticated
    }
  }
  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  if (!userEmail || !adminEmails.includes(userEmail.toLowerCase())) {
    throw new Error('403 Forbidden: admin access required')
  }
}
