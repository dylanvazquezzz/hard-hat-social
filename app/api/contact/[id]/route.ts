import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = getSupabaseAdmin()

  // Verify the token and get the requesting user
  const { data: { user }, error: authError } = await admin.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if requesting user is an approved contractor (by user_id, fallback to email)
  const { data: viewerById } = await admin
    .from('contractors')
    .select('status')
    .eq('user_id', user.id)
    .eq('status', 'approved')
    .single()

  let isApproved = !!viewerById

  if (!isApproved && user.email) {
    const { data: viewerByEmail } = await admin
      .from('contractors')
      .select('status')
      .eq('email', user.email)
      .eq('status', 'approved')
      .single()
    isApproved = !!viewerByEmail
  }

  if (!isApproved) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Fetch contact info for the requested contractor
  const { data: contact } = await admin
    .from('contractors')
    .select('phone, email')
    .eq('id', params.id)
    .eq('status', 'approved')
    .single()

  if (!contact) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(contact)
}
