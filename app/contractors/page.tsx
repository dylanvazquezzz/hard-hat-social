import { getSupabaseAdmin } from '@/lib/supabase-admin'
import ContractorCard from '@/components/ContractorCard'
import SearchFilters from '@/components/SearchFilters'
import PostCard from '@/components/PostCard'
import type { Contractor, Post } from '@/lib/types'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: { trade?: string; state?: string; q?: string }
}

export default async function ContractorsPage({ searchParams }: PageProps) {
  const admin = getSupabaseAdmin()
  let query = admin
    .from('contractors')
    .select('id, user_id, full_name, trade, specialties, location_city, location_state, years_experience, bio, website, profile_photo_url, status, created_at')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  if (searchParams.trade) {
    query = query.eq('trade', searchParams.trade)
  }

  if (searchParams.state) {
    query = query.eq('location_state', searchParams.state)
  }

  if (searchParams.q) {
    const term = `%${searchParams.q}%`
    query = query.or(
      `full_name.ilike.${term},trade.ilike.${term},location_city.ilike.${term},bio.ilike.${term}`
    )
  }

  const [{ data, error }, { data: postsData }] = await Promise.all([
    query,
    admin
      .from('posts')
      .select('*, profiles(username, avatar_url), contractors(full_name, trade, location_city, location_state)')
      .eq('category', 'jobs')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  if (error) {
    console.error('Error fetching contractors:', error)
  }

  const contractors = (data as Contractor[]) ?? []
  const posts = (postsData as Post[]) ?? []

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100">Contractor Directory</h1>
        <p className="mt-2 text-slate-400">
          {contractors.length} verified contractor{contractors.length !== 1 ? 's' : ''}
          {searchParams.trade ? ` in ${searchParams.trade}` : ''}
          {searchParams.state ? ` · ${searchParams.state}` : ''}
          {searchParams.q ? ` matching "${searchParams.q}"` : ''}
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-56">
          <SearchFilters
            currentTrade={searchParams.trade}
            currentState={searchParams.state}
            currentQuery={searchParams.q}
          />
        </aside>

        <div className="flex-1 space-y-10">
          {/* Contractor grid */}
          {contractors.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-slate-800 bg-slate-900 py-24 text-center">
              <svg
                className="mb-4 h-12 w-12 text-slate-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <p className="font-medium text-slate-300">No contractors match your filters</p>
              <p className="mt-1 text-sm text-slate-500">Try broadening your search or clearing all filters.</p>
              <a
                href="/contractors"
                className="mt-6 rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700 transition-colors"
              >
                Reset filters
              </a>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {contractors.map((contractor) => (
                <ContractorCard key={contractor.id} contractor={contractor} />
              ))}
            </div>
          )}

          {/* Job Posts feed */}
          {posts.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-slate-100">Job Posts</h2>
              <div className="space-y-3">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
