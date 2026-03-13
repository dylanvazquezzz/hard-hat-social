'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'
import { createComment } from '@/app/explore/actions'
import type { Comment } from '@/lib/types'

// Browser-side Supabase client (anon key, respects RLS)
function getBrowserSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

interface Props {
  postId: string
  initialCount: number
}

export default function CommentThread({ postId, initialCount }: Props) {
  const [open, setOpen] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [text, setText] = useState('')
  const [count, setCount] = useState(initialCount)

  const fetchComments = useCallback(async () => {
    setLoading(true)
    setError(null)
    const supabase = getBrowserSupabase()
    const { data, error: fetchErr } = await supabase
      .from('comments')
      .select('*, profiles(username, avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (fetchErr) {
      setError('Failed to load comments.')
    } else {
      setComments((data as Comment[]) ?? [])
      setCount((data ?? []).length)
    }
    setLoading(false)
  }, [postId])

  useEffect(() => {
    if (open && comments.length === 0 && !loading) {
      fetchComments()
    }
  }, [open, comments.length, loading, fetchComments])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || submitting) return
    setSubmitting(true)
    setError(null)
    const result = await createComment(postId, text)
    if (result.error) {
      setError(result.error === 'Unauthorized' ? 'You must be logged in to comment.' : result.error)
      setSubmitting(false)
    } else {
      setText('')
      await fetchComments()
      setSubmitting(false)
    }
  }

  return (
    <div className="border-t border-slate-800/60 bg-slate-900/30">
      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-1.5 px-4 py-2.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        aria-expanded={open}
      >
        <span className="text-sm">💬</span>
        <span>
          {count === 0
            ? 'No comments · Add one'
            : count === 1
            ? '1 comment'
            : `${count} comments`}
        </span>
        <span className="ml-auto text-slate-600">{open ? '▲' : '▼'}</span>
      </button>

      {/* Thread panel */}
      {open && (
        <div className="px-4 pb-4 space-y-4">
          {/* Comment list */}
          {loading ? (
            <div className="flex items-center gap-2 py-2">
              <div className="h-1.5 w-1.5 rounded-full bg-slate-600 animate-bounce [animation-delay:-0.3s]" />
              <div className="h-1.5 w-1.5 rounded-full bg-slate-600 animate-bounce [animation-delay:-0.15s]" />
              <div className="h-1.5 w-1.5 rounded-full bg-slate-600 animate-bounce" />
            </div>
          ) : comments.length === 0 ? (
            <p className="py-2 text-xs text-slate-500 italic">No comments yet. Be the first.</p>
          ) : (
            <ul className="space-y-3 pt-1">
              {comments.map((c) => {
                const username = c.profiles?.username ?? 'user'
                const avatarUrl = c.profiles?.avatar_url
                const initials = username.charAt(0).toUpperCase()
                return (
                  <li key={c.id} className="flex gap-2.5 items-start">
                    <a
                      href={`/u/${username}`}
                      className="shrink-0 mt-0.5"
                    >
                      <div className="relative h-7 w-7 overflow-hidden rounded-full bg-slate-700">
                        {avatarUrl ? (
                          <Image
                            src={avatarUrl}
                            alt={username}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-xs font-bold text-amber-500">
                            {initials}
                          </span>
                        )}
                      </div>
                    </a>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <a
                          href={`/u/${username}`}
                          className="text-xs font-semibold text-slate-300 hover:text-amber-400 transition-colors"
                        >
                          @{username}
                        </a>
                        <span className="text-[10px] text-slate-600">{timeAgo(c.created_at)}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {c.content}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}

          {/* Submit form */}
          <form onSubmit={handleSubmit} className="flex gap-2 items-end pt-1">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a comment…"
              rows={2}
              maxLength={500}
              className="flex-1 resize-none rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-colors"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e as unknown as React.FormEvent)
                }
              }}
            />
            <button
              type="submit"
              disabled={!text.trim() || submitting}
              className="shrink-0 rounded-md bg-amber-500 px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? '…' : 'Post'}
            </button>
          </form>

          {/* Inline error */}
          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}
        </div>
      )}
    </div>
  )
}
