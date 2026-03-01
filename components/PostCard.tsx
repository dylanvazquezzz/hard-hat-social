import Image from 'next/image'
import type { Post } from '@/lib/types'

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

const categoryLabel: Record<Post['category'], string> = {
  social: 'Social',
  qa: 'Q&A',
  jobs: 'Jobs',
}

const categoryColor: Record<Post['category'], string> = {
  social: 'text-slate-400 bg-slate-800',
  qa: 'text-blue-400 bg-blue-900/40',
  jobs: 'text-amber-400 bg-amber-900/40',
}

interface Props {
  post: Post
  showAuthor?: boolean
}

export default function PostCard({ post, showAuthor = true }: Props) {
  const username = post.profiles?.username
  const avatarUrl = post.profiles?.avatar_url
  const trade = post.contractors?.trade
  const city = post.contractors?.location_city
  const state = post.contractors?.location_state
  const initials = username ? username.charAt(0).toUpperCase() : '?'

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {showAuthor && (
            <a href={username ? `/u/${username}` : '#'} className="shrink-0">
              <div className="relative h-9 w-9 overflow-hidden rounded-full bg-slate-700">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt={username ?? ''} fill className="object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-sm font-bold text-amber-500">
                    {initials}
                  </span>
                )}
              </div>
            </a>
          )}
          <div className="min-w-0">
            {showAuthor && (
              <a
                href={username ? `/u/${username}` : '#'}
                className="text-sm font-semibold text-slate-100 hover:text-amber-400 transition-colors"
              >
                {username ? `@${username}` : 'Unknown'}
              </a>
            )}
            {(trade || city) && (
              <p className="text-xs text-slate-400">
                {[trade, city && state ? `${city}, ${state}` : city].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${categoryColor[post.category]}`}>
            {categoryLabel[post.category]}
          </span>
          <span className="text-xs text-slate-500">{timeAgo(post.created_at)}</span>
        </div>
      </div>

      <p className="text-sm text-slate-200 whitespace-pre-wrap">{post.content}</p>

      {post.image_url && (
        <div className="relative mt-3 h-48 w-full overflow-hidden rounded">
          <Image src={post.image_url} alt="post image" fill className="object-cover" />
        </div>
      )}

      {post.link_url && (
        <a
          href={post.link_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block text-xs text-slate-400 hover:text-slate-200 truncate"
        >
          🔗 {post.link_url}
        </a>
      )}
    </div>
  )
}
