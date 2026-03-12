'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import type { Profile, Post, Contractor } from '@/lib/types'
import type { User } from '@supabase/supabase-js'

type Tab = 'profile' | 'posts' | 'settings'

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [contractor, setContractor] = useState<Contractor | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [tab, setTab] = useState<Tab>('profile')
  const [loading, setLoading] = useState(true)
  const [isPending, setIsPending] = useState(false)

  // Profile tab state
  const [avatarUploading, setAvatarUploading] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  // Posts tab state
  const [postContent, setPostContent] = useState('')
  const [postLink, setPostLink] = useState('')
  const [postImage, setPostImage] = useState<File | null>(null)
  const [postImagePreview, setPostImagePreview] = useState<string | null>(null)
  const [postCategory, setPostCategory] = useState<'social' | 'qa'>('social')
  const [postSubmitting, setPostSubmitting] = useState(false)
  const postImageRef = useRef<HTMLInputElement>(null)

  // Settings tab state
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [settingsMsg, setSettingsMsg] = useState('')
  const [settingsSaving, setSettingsSaving] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace('/auth')
        return
      }
      // Check for pending application before loading full profile
      const { data: app } = await supabase
        .from('applications')
        .select('status')
        .eq('user_id', session.user.id)
        .eq('status', 'pending')
        .maybeSingle()
      if (app) {
        setIsPending(true)
        setLoading(false)
        return
      }
      setUser(session.user)
      await Promise.all([
        loadProfile(session.user.id),
        loadContractor(session.user.id),
        loadPosts(session.user.id),
      ])
      setLoading(false)
    })
  }, [router])

  async function loadProfile(userId: string) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile(data)
    if (data) setNewUsername(data.username)
  }

  async function loadContractor(userId: string) {
    const { data } = await supabase
      .from('contractors')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'approved')
      .single()
    setContractor(data)
  }

  async function loadPosts(userId: string) {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    setPosts((data as Post[]) ?? [])
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setAvatarUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${user.id}.${ext}`
    const { error: uploadErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (uploadErr) {
      alert('Upload failed: ' + uploadErr.message)
      setAvatarUploading(false)
      return
    }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    const { error: updateErr } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
      .eq('id', user.id)
    if (!updateErr) {
      setProfile((p) => p ? { ...p, avatar_url: publicUrl } : p)
    }
    setAvatarUploading(false)
  }

  async function handleCreateProfile() {
    if (!user || !newUsername.trim()) return
    const { data, error } = await supabase
      .from('profiles')
      .insert({ id: user.id, username: newUsername.trim().toLowerCase() })
      .select()
      .single()
    if (error) {
      alert('Error: ' + error.message)
    } else {
      setProfile(data)
    }
  }

  async function handlePostImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPostImage(file)
    setPostImagePreview(URL.createObjectURL(file))
  }

  async function handleSubmitPost(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !postContent.trim()) return
    setPostSubmitting(true)

    let image_url: string | null = null
    if (postImage) {
      const ext = postImage.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error: uploadErr } = await supabase.storage
        .from('post-images')
        .upload(path, postImage)
      if (uploadErr) {
        alert('Image upload failed: ' + uploadErr.message)
        setPostSubmitting(false)
        return
      }
      const { data: { publicUrl } } = supabase.storage.from('post-images').getPublicUrl(path)
      image_url = publicUrl
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        contractor_id: contractor?.id ?? null,
        content: postContent.trim(),
        image_url,
        link_url: postLink.trim() || null,
        category: postCategory,
      })
      .select()
      .single()

    if (error) {
      alert('Error: ' + error.message)
    } else {
      setPosts((p) => [data as Post, ...p])
      setPostContent('')
      setPostLink('')
      setPostImage(null)
      setPostImagePreview(null)
    }
    setPostSubmitting(false)
  }

  async function handleDeletePost(postId: string) {
    const { error } = await supabase.from('posts').delete().eq('id', postId)
    if (!error) setPosts((p) => p.filter((post) => post.id !== postId))
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSettingsSaving(true)
    setSettingsMsg('')

    if (newUsername.trim() && newUsername.trim().toLowerCase() !== profile?.username) {
      const slug = newUsername.trim().toLowerCase()
      // check uniqueness
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', slug)
        .neq('id', user.id)
        .single()
      if (existing) {
        setSettingsMsg('That username is already taken.')
        setSettingsSaving(false)
        return
      }
      const { error } = await supabase
        .from('profiles')
        .update({ username: slug, updated_at: new Date().toISOString() })
        .eq('id', user.id)
      if (error) {
        setSettingsMsg('Error saving username: ' + error.message)
        setSettingsSaving(false)
        return
      }
      setProfile((p) => p ? { ...p, username: slug } : p)
    }

    if (newPassword) {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) {
        setSettingsMsg('Error updating password: ' + error.message)
        setSettingsSaving(false)
        return
      }
      setNewPassword('')
    }

    setSettingsMsg('Saved.')
    setSettingsSaving(false)
  }

  if (loading) return null

  if (isPending) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-100">Application Under Review</h1>
        <p className="mt-3 text-slate-400">
          Your application is being reviewed by our team. You&apos;ll receive an email once
          it&apos;s approved or if we need more information.
        </p>
        <p className="mt-2 text-slate-400">
          In the meantime, you can browse the{' '}
          <a href="/explore" className="text-amber-400 hover:underline">
            Explore feed
          </a>{' '}
          for community posts and Q&amp;A.
        </p>
      </div>
    )
  }

  const initials = profile?.username?.charAt(0).toUpperCase() ?? user?.email?.charAt(0).toUpperCase() ?? '?'

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* Welcome banner — shown to approved contractors who haven't uploaded a photo yet */}
      {contractor && !profile?.avatar_url && (
        <div className="mb-6 rounded-lg border border-amber-500/40 bg-amber-500/10 px-5 py-4">
          <p className="text-sm font-semibold text-amber-400">Welcome to Hard Hat Social</p>
          <p className="mt-1 text-sm text-slate-300">
            Complete your profile to appear in the directory — upload a photo to get started.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex items-center gap-5">
        <button
          onClick={() => avatarInputRef.current?.click()}
          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-800"
          disabled={avatarUploading}
          title="Upload avatar"
        >
          {profile?.avatar_url ? (
            <Image src={profile.avatar_url} alt="avatar" fill className="object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-3xl font-bold text-amber-500">
              {initials}
            </span>
          )}
          {avatarUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/70 text-xs text-slate-300">
              Uploading…
            </div>
          )}
        </button>
        <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />

        <div>
          <p className="text-xl font-bold text-slate-100">
            {profile ? `@${profile.username}` : 'No username set'}
          </p>
          <p className="text-sm text-slate-400">{user?.email}</p>
          {contractor && (
            <p className="mt-1 text-sm text-amber-500">
              {contractor.trade} · {contractor.location_city}, {contractor.location_state}
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-slate-800">
        {(['profile', 'posts', 'settings'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
              tab === t
                ? 'border-b-2 border-amber-500 text-amber-500'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <div className="space-y-6">
          {!profile ? (
            <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
              <h2 className="mb-4 text-lg font-semibold text-slate-100">Create your profile</h2>
              <label className="block text-sm text-slate-400 mb-1">Choose a @username</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="e.g. dylan"
                  className="flex-1 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  onClick={handleCreateProfile}
                  className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400 transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-slate-100">Profile</h2>
              <div>
                <p className="text-sm text-slate-400">Username</p>
                <p className="text-slate-100">@{profile.username}</p>
              </div>
              {contractor && (
                <>
                  <div>
                    <p className="text-sm text-slate-400">Trade</p>
                    <p className="text-slate-100">{contractor.trade}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Location</p>
                    <p className="text-slate-100">{contractor.location_city}, {contractor.location_state}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Bio</p>
                    <p className="text-slate-100">{contractor.bio}</p>
                  </div>
                </>
              )}
              <p className="text-xs text-slate-500">
                Click your avatar above to change your profile photo.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Posts Tab */}
      {tab === 'posts' && (
        <div className="space-y-6">
          {!profile ? (
            <p className="text-slate-400">Set a username in the Profile tab first.</p>
          ) : (
            <>
              <form onSubmit={handleSubmitPost} className="rounded-lg border border-slate-800 bg-slate-900 p-4 space-y-3">
                <div className="flex gap-2">
                  {(['social', 'qa'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setPostCategory(cat)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        postCategory === cat
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-100'
                      }`}
                    >
                      {cat === 'social' ? 'Social' : 'Q&A'}
                    </button>
                  ))}
                  <a
                    href="/jobs"
                    className="rounded-full px-3 py-1 text-xs font-medium bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
                  >
                    Jobs →
                  </a>
                </div>
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="What's on your mind? Looking for subs, available for work, tips…"
                  rows={3}
                  className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
                <input
                  type="url"
                  value={postLink}
                  onChange={(e) => setPostLink(e.target.value)}
                  placeholder="Link URL (optional)"
                  className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                {postImagePreview && (
                  <div className="relative w-40 h-28 rounded overflow-hidden border border-slate-700">
                    <Image src={postImagePreview} alt="preview" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => { setPostImage(null); setPostImagePreview(null) }}
                      className="absolute top-1 right-1 rounded bg-slate-900/80 px-1 text-xs text-slate-300 hover:text-slate-100"
                    >
                      ✕
                    </button>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => postImageRef.current?.click()}
                    className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    + Add image
                  </button>
                  <input ref={postImageRef} type="file" accept="image/*" className="hidden" onChange={handlePostImageChange} />
                  <button
                    type="submit"
                    disabled={postSubmitting || !postContent.trim()}
                    className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400 transition-colors disabled:opacity-50"
                  >
                    {postSubmitting ? 'Posting…' : 'Post'}
                  </button>
                </div>
              </form>

              <div className="space-y-3">
                {posts.length === 0 && (
                  <p className="text-center text-slate-500 py-8">No posts yet.</p>
                )}
                {posts.map((post) => (
                  <div key={post.id} className="rounded-lg border border-slate-800 bg-slate-900 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-100 whitespace-pre-wrap">{post.content}</p>
                        {post.image_url && (
                          <div className="relative mt-2 h-48 w-full max-w-sm overflow-hidden rounded">
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
                        <p className="mt-2 text-xs text-slate-500">{timeAgo(post.created_at)}</p>
                      </div>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="shrink-0 text-xs text-slate-500 hover:text-red-400 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {tab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="rounded-lg border border-slate-800 bg-slate-900 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-slate-100">Settings</h2>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Email (read-only)</label>
            <input
              type="email"
              value={user?.email ?? ''}
              disabled
              className="w-full rounded-md border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Change @username</label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="new_username"
              className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Leave blank to keep current"
              className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {settingsMsg && (
            <p className={`text-sm ${settingsMsg === 'Saved.' ? 'text-emerald-400' : 'text-red-400'}`}>
              {settingsMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={settingsSaving}
            className="rounded-md bg-amber-500 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400 transition-colors disabled:opacity-50"
          >
            {settingsSaving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      )}
    </div>
  )
}
