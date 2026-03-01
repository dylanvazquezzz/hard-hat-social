import { supabase } from '@/lib/supabase'
import PostCard from '@/components/PostCard'
import type { Post } from '@/lib/types'

export const dynamic = 'force-dynamic'

const EXAMPLE_POSTS = [
  {
    username: 'rwtx_welds',
    trade: 'Welding',
    location: 'Houston, TX',
    content:
      'Looking for 2 certified TIG welders for a structural steel project in Houston. 6-week job starting mid-March. AWS D1.1 required, union rates. Reply here or reach out directly.',
    time: '2h ago',
  },
  {
    username: 'pipelinepro_tx',
    trade: 'Pipe Welding',
    location: 'Beaumont, TX',
    content:
      'Pipe welding subs needed for an industrial plant shutdown — 2 weeks, must have NCCER + TWIC card. Travel bonus available for qualified guys. Serious inquiries only.',
    time: '1d ago',
  },
  {
    username: 'hvacdave_dfw',
    trade: 'HVAC',
    location: 'Dallas, TX',
    content:
      'Need a commercial HVAC sub for a 10-unit apartment retrofit in North Dallas. EPA 608 required, 3-week project, good pay. PM me if you\'re available.',
    time: '3d ago',
  },
]

export default async function JobsPage() {
  const { data: postsData } = await supabase
    .from('posts')
    .select('*, profiles(username, avatar_url), contractors(full_name, trade, location_city, location_state)')
    .eq('category', 'jobs')
    .order('created_at', { ascending: false })
    .limit(50)

  const posts = (postsData as Post[]) ?? []

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Jobs Board</h1>
          <p className="mt-1 text-slate-400">
            Subcontracting opportunities posted by verified contractors
          </p>
        </div>
        <a
          href="/profile"
          className="shrink-0 rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400 transition-colors"
        >
          + Post a Job
        </a>
      </div>

      {posts.length === 0 ? (
        <div className="space-y-3">
          {/* Empty state message */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 px-5 py-4 text-center">
            <p className="text-sm text-slate-400">
              No job posts yet. Be the first to post a subcontracting opportunity.
            </p>
          </div>

          {/* Placeholder example cards */}
          <p className="pt-2 text-xs font-medium uppercase tracking-wider text-slate-600">
            Example posts
          </p>
          {EXAMPLE_POSTS.map((ex, i) => (
            <div
              key={i}
              className="relative rounded-lg border border-slate-800/60 bg-slate-900/40 p-4 opacity-60"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-700 text-sm font-bold text-amber-500">
                    {ex.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-100">@{ex.username}</p>
                    <p className="text-xs text-slate-400">
                      {ex.trade} · {ex.location}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="rounded-full bg-amber-900/40 px-2 py-0.5 text-xs font-medium text-amber-400">
                    Jobs
                  </span>
                  <span className="text-xs text-slate-500">{ex.time}</span>
                </div>
              </div>
              <p className="text-sm text-slate-300">{ex.content}</p>
              <span className="absolute right-3 top-3 rounded bg-slate-800 px-1.5 py-0.5 text-xs text-slate-500">
                example
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
