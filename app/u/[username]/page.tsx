import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import CertificationBadge from '@/components/CertificationBadge'
import PostCard from '@/components/PostCard'
import type { Post, Certification } from '@/lib/types'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { username: string }
}

export default async function PublicProfilePage({ params }: PageProps) {
  const admin = getSupabaseAdmin()
  const { data: profile } = await admin
    .from('profiles')
    .select('*')
    .eq('username', params.username)
    .single()

  if (!profile) notFound()

  const [{ data: contractorData }, { data: postsData }] = await Promise.all([
    admin
      .from('contractors')
      .select('*')
      .eq('user_id', profile.id)
      .eq('status', 'approved')
      .single(),
    admin
      .from('posts')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false }),
  ])

  const contractor = contractorData ?? null
  const posts = (postsData as Post[]) ?? []

  let certifications: Certification[] = []
  if (contractor) {
    const { data: certData } = await admin
      .from('certifications')
      .select('*')
      .eq('contractor_id', contractor.id)
    certifications = certData ?? []
  }

  const initials = profile.username.charAt(0).toUpperCase()

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Profile Header */}
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-800 sm:h-28 sm:w-28">
          {profile.avatar_url ? (
            <Image src={profile.avatar_url} alt={profile.username} fill className="object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-3xl font-bold text-amber-500">
              {initials}
            </span>
          )}
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-100 sm:text-3xl">@{profile.username}</h1>
            {contractor && (
              <span className="rounded-full bg-emerald-900/50 px-3 py-1 text-sm font-medium text-emerald-400">
                Verified
              </span>
            )}
          </div>
          {contractor && (
            <>
              <p className="mt-1 text-lg font-semibold text-amber-500">{contractor.trade}</p>
              <p className="mt-1 text-sm text-slate-400">
                {contractor.location_city}, {contractor.location_state} · {contractor.years_experience} years experience
              </p>
              {contractor.website && (
                <a
                  href={contractor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {contractor.website}
                </a>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Main: bio + posts */}
        <div className="flex-1 min-w-0">
          {contractor?.bio && (
            <div className="mb-6 rounded-lg border border-slate-800 bg-slate-900 p-5">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">About</h2>
              <p className="text-sm text-slate-300 whitespace-pre-wrap">{contractor.bio}</p>
            </div>
          )}

          {/* Posts */}
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">Posts</h2>
          {posts.length === 0 ? (
            <p className="text-slate-500">No posts yet.</p>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} showAuthor={false} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: certifications */}
        {certifications.length > 0 && (
          <aside className="w-full shrink-0 lg:w-64">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Certifications</h2>
            <div className="space-y-2">
              {certifications.map((cert) => (
                <CertificationBadge key={cert.id} certification={cert} />
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
