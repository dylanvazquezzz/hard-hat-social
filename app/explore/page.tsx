import { supabase } from '@/lib/supabase'
import PostCard from '@/components/PostCard'
import type { Post } from '@/lib/types'

export const dynamic = 'force-dynamic'

type Category = 'social' | 'qa'

const tabs: { key: Category; label: string; description: string }[] = [
  { key: 'social', label: 'Social', description: 'Updates & availability' },
  { key: 'qa', label: 'Q&A', description: 'Advice & questions' },
]

const EXAMPLE_POSTS: Record<Category, { username: string; trade: string; location: string; content: string; time: string }[]> = {
  social: [
    {
      username: 'ironsmith_j',
      trade: 'Welding',
      location: 'San Antonio, TX',
      content:
        'Just wrapped up 3 months on a pipeline job in West Texas. Good pay, solid crew. Back in SA now and available for local structural work — reach out if you need a certified TIG welder.',
      time: '4h ago',
    },
    {
      username: 'sparky_bc',
      trade: 'Electrical',
      location: 'Phoenix, AZ',
      content:
        'Picked up a big commercial contract in Phoenix and need 3 journeymen electricians for a 6-month run. Good rates, consistent work. Any licensed guys in the Valley looking?',
      time: '1d ago',
    },
    {
      username: 'cold_side_hvac',
      trade: 'HVAC',
      location: 'Atlanta, GA',
      content:
        'Finished up a 200-unit apartment complex retrofit last week. Biggest HVAC job I\'ve done yet. If anyone\'s looking for commercial HVAC sub work in the southeast, connect with me.',
      time: '2d ago',
    },
  ],
  qa: [
    {
      username: 'tig_master_k',
      trade: 'Welding',
      location: 'Denver, CO',
      content:
        'What welding hood are you guys using for outdoor work? My auto-darkening keeps lagging in direct sunlight. Thinking about switching to the Miller Digital Elite — anyone running that?',
      time: '6h ago',
    },
    {
      username: 'plumb_pro_nash',
      trade: 'Plumbing',
      location: 'Nashville, TN',
      content:
        'Question for the subs here — how are you handling liability coverage on short-term gigs? My current GL policy doesn\'t cover subwork and the GC is asking for a cert of insurance.',
      time: '2d ago',
    },
  ],
}

interface PageProps {
  searchParams: { category?: string }
}

export default async function ExplorePage({ searchParams }: PageProps) {
  const rawCategory = searchParams.category ?? 'social'
  const category: Category = ['social', 'qa'].includes(rawCategory)
    ? (rawCategory as Category)
    : 'social'

  const { data: postsData } = await supabase
    .from('posts')
    .select('*, profiles(username, avatar_url), contractors(full_name, trade, location_city, location_state)')
    .eq('category', category)
    .order('created_at', { ascending: false })
    .limit(20)

  const posts = (postsData as Post[]) ?? []
  const examples = EXAMPLE_POSTS[category]

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Explore</h1>
          <p className="mt-1 text-slate-400">See what the community is posting</p>
        </div>
        <a
          href="/profile"
          className="shrink-0 rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
        >
          + Post
        </a>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-slate-800">
        {tabs.map((t) => (
          <a
            key={t.key}
            href={`/explore?category=${t.key}`}
            className={`flex flex-col px-4 py-2 text-sm font-medium transition-colors ${
              category === t.key
                ? 'border-b-2 border-amber-500 text-amber-500'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            {t.label}
            <span className="text-xs font-normal text-slate-500">{t.description}</span>
          </a>
        ))}
      </div>

      {posts.length === 0 ? (
        <div className="space-y-3">
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 px-5 py-4 text-center">
            <p className="text-sm text-slate-400">
              No posts yet.{' '}
              <a href="/profile" className="text-amber-400 hover:underline">
                Be the first to post.
              </a>
            </p>
          </div>

          <p className="pt-2 text-xs font-medium uppercase tracking-wider text-slate-600">
            Example posts
          </p>
          {examples.map((ex, i) => (
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
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    category === 'qa' ? 'bg-blue-900/40 text-blue-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {category === 'qa' ? 'Q&A' : 'Social'}
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
