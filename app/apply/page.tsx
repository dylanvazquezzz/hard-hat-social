'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const TRADES = ['Welding', 'HVAC', 'Electrical', 'Plumbing', 'General Contractor', 'Drywall']

const SPECIALTIES_BY_TRADE: Record<string, string[]> = {
  Welding: [
    'TIG Welding',
    'MIG Welding',
    'Stick Welding',
    'Pipe Welding',
    'Structural Welding',
    'Underwater Welding',
    'Aluminum Welding',
    'Stainless Steel',
  ],
  HVAC: ['Commercial HVAC', 'Residential HVAC', 'Refrigeration', 'Sheet Metal', 'Controls'],
  Electrical: [
    'Commercial',
    'Residential',
    'Industrial',
    'Low Voltage',
    'Solar',
    'Generator Systems',
  ],
  Plumbing: ['Commercial', 'Residential', 'Pipefitting', 'Fire Suppression', 'Gas Lines'],
  'General Contractor': ['Remodeling', 'New Construction', 'Commercial Build-Out', 'Concrete'],
  Drywall: [
    'New Construction',
    'Remodeling',
    'Commercial',
    'Residential',
    'Taping & Finishing',
    'Texture',
    'Acoustic Ceilings',
  ],
}

const CREDENTIAL_NOTES: Record<string, string[]> = {
  Welding: [
    'AWS certification or equivalent',
    'State contractor license',
    'Proof of general liability insurance',
    'D1.1 / D1.5 structural certs (if applicable)',
  ],
  HVAC: ['EPA 608 certification', 'State HVAC license', 'Proof of general liability insurance'],
  Electrical: ['State electrician license', 'Proof of general liability insurance'],
  Plumbing: ['State plumber license', 'Proof of general liability insurance'],
  'General Contractor': [
    'State GC license',
    'Proof of general liability insurance',
    'Bonding documentation',
  ],
  Drywall: [
    'State contractor license',
    'Proof of general liability insurance',
  ],
}

type FormState = {
  full_name: string
  email: string
  password: string
  confirm_password: string
  phone: string
  website: string
  trade: string
  specialties: string[]
  location_city: string
  location_state: string
  years_experience: string
  bio: string
}

const MAX_DOCS = 3
const ACCEPTED_DOC_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']

export default function ApplyPage() {
  const [form, setForm] = useState<FormState>({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    phone: '',
    website: '',
    trade: '',
    specialties: [],
    location_city: '',
    location_state: '',
    years_experience: '',
    bio: '',
  })
  const [docs, setDocs] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
      // Clear specialties when trade changes
      ...(name === 'trade' ? { specialties: [] } : {}),
    }))
  }

  function toggleSpecialty(specialty: string) {
    setForm((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter((s) => s !== specialty)
        : [...prev.specialties, specialty],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm_password) {
      setError('Passwords do not match.')
      return
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)

    // Create auth account — if email already exists, that's fine, just proceed
    const { data: signUpData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (authError && authError.code !== 'user_already_exists') {
      setError(authError.message)
      setLoading(false)
      return
    }

    const userId = signUpData?.user?.id ?? null

    // Generate ID client-side so we never need to SELECT after insert.
    // Avoids hitting the SELECT RLS policy (which requires auth.uid()) for anon users.
    const appId = crypto.randomUUID()
    const applicationPayload: Record<string, unknown> = {
      id: appId,
      full_name: form.full_name,
      email: form.email,
      phone: form.phone,
      website: form.website || null,
      trade: form.trade,
      specialties: form.specialties,
      location_city: form.location_city,
      location_state: form.location_state.toUpperCase(),
      years_experience: parseInt(form.years_experience),
      bio: form.bio,
      status: 'pending',
    }
    if (userId) {
      applicationPayload.user_id = userId
    }

    const { error: dbError } = await supabase
      .from('applications')
      .insert([applicationPayload])

    if (dbError) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
      return
    }

    const appData = { id: appId }

    // Upload credential documents if any were attached
    if (docs.length > 0) {
      // Resolve the upload user ID: userId is null for returning users (user_already_exists).
      // Fall back to the current authenticated session in that case.
      let uploadUserId = userId
      if (!uploadUserId) {
        const { data: { session } } = await supabase.auth.getSession()
        uploadUserId = session?.user?.id ?? null
      }

      if (!uploadUserId) {
        // No authenticated user to key upload path on — skip document upload.
        // Application is still created; admin can request docs separately.
        setLoading(false)
        setSubmitted(true)
        return
      }

      const uploadedUrls: string[] = []

      for (const file of docs) {
        const ext = file.name.split('.').pop()
        // Use uploadUserId so path matches RLS policy: (storage.foldername(name))[1] = auth.uid()::text
        const path = `${uploadUserId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
        const { error: uploadErr } = await supabase.storage
          .from('application-docs')
          .upload(path, file)

        if (!uploadErr) {
          const { data: { publicUrl } } = supabase.storage
            .from('application-docs')
            .getPublicUrl(path)
          uploadedUrls.push(publicUrl)
        }
      }

      if (uploadedUrls.length > 0) {
        await supabase
          .from('applications')
          .update({ document_urls: uploadedUrls })
          .eq('id', appData.id)
      }
    }

    setLoading(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl px-4 py-28 text-center sm:px-6">
        <div className="mb-6 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-900/50">
            <span className="text-2xl text-emerald-400">✓</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-100">Application Submitted</h1>
        <p className="mt-4 text-slate-400">
          We&apos;ll review your credentials and follow up within 2–3 business days.
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Your account has been created. Once approved, sign in with your email and password to access contact info.
        </p>
      </div>
    )
  }

  const availableSpecialties = SPECIALTIES_BY_TRADE[form.trade] ?? []
  const credentialNotes = CREDENTIAL_NOTES[form.trade] ?? []

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      {process.env.NEXT_PUBLIC_CONTACT_EMAIL && (
        <div className="mb-8 rounded-lg border border-slate-700 bg-slate-800/60 px-5 py-4 text-sm text-slate-300">
          <strong className="text-slate-100">Invite-only onboarding:</strong>{' '}
          Hard Hat Social is currently onboarding by invitation. If you were referred by someone,
          fill out the form below. To request an invite, email{' '}
          <a
            href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}`}
            className="text-amber-400 hover:text-amber-300"
          >
            {process.env.NEXT_PUBLIC_CONTACT_EMAIL}
          </a>
          .
        </div>
      )}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100">Apply to Join</h1>
        <p className="mt-2 text-slate-400">
          All applicants are manually reviewed. Only credentialed tradespeople are approved.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal info */}
        <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-5 text-lg font-semibold text-slate-100">Your Information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-400">Full Name *</label>
              <input
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                placeholder="John Smith"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">Email *</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">Password *</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                placeholder="Min. 8 characters"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">Confirm Password *</label>
              <input
                name="confirm_password"
                type="password"
                value={form.confirm_password}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                placeholder="Re-enter password"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">Phone *</label>
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                placeholder="(555) 000-0000"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">Website</label>
              <input
                name="website"
                type="url"
                value={form.website}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                placeholder="https://yoursite.com"
              />
            </div>
          </div>
        </section>

        {/* Trade info */}
        <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-5 text-lg font-semibold text-slate-100">Trade & Experience</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-400">Primary Trade *</label>
              <select
                name="trade"
                value={form.trade}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="">Select trade...</option>
                {TRADES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">Years of Experience *</label>
              <input
                name="years_experience"
                type="number"
                min="0"
                max="60"
                value={form.years_experience}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                placeholder="10"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">City *</label>
              <input
                name="location_city"
                value={form.location_city}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                placeholder="Houston"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">State *</label>
              <input
                name="location_state"
                value={form.location_state}
                onChange={handleChange}
                required
                maxLength={2}
                className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 uppercase text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                placeholder="TX"
              />
            </div>
          </div>

          {availableSpecialties.length > 0 && (
            <div className="mt-4">
              <label className="mb-2 block text-sm text-slate-400">Specialties</label>
              <div className="flex flex-wrap gap-2">
                {availableSpecialties.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSpecialty(s)}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      form.specialties.includes(s)
                        ? 'bg-amber-500 text-slate-950'
                        : 'border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4">
            <label className="mb-1 block text-sm text-slate-400">Bio / About You *</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              required
              rows={4}
              className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              placeholder="Tell us about your work, experience, and what makes you stand out..."
            />
          </div>
        </section>

        {/* Credential notes + document upload */}
        {credentialNotes.length > 0 && (
          <section className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-6">
            <h2 className="mb-2 text-base font-semibold text-amber-400">
              Credential Verification
            </h2>
            <p className="mb-3 text-sm text-slate-400">
              Upload your credentials below. Accepted: PDF, JPG, PNG (max 10 MB each, up to 3 files).
            </p>
            <ul className="mb-5 space-y-1 text-sm text-slate-400">
              {credentialNotes.map((note) => (
                <li key={note}>· {note}</li>
              ))}
            </ul>

            <div className="space-y-3">
              <label className="block text-sm text-slate-300 font-medium">
                Upload documents ({docs.length}/{MAX_DOCS})
              </label>
              <label className={`flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-slate-600 bg-slate-800/50 px-4 py-3 text-sm text-slate-400 hover:border-amber-500/60 hover:text-slate-300 transition-colors ${docs.length >= MAX_DOCS ? 'pointer-events-none opacity-50' : ''}`}>
                <span>+ Add file</span>
                <input
                  type="file"
                  accept={ACCEPTED_DOC_TYPES.join(',')}
                  className="hidden"
                  disabled={docs.length >= MAX_DOCS}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) setDocs((prev) => [...prev, file].slice(0, MAX_DOCS))
                    e.target.value = ''
                  }}
                />
              </label>
              {docs.length > 0 && (
                <ul className="space-y-2">
                  {docs.map((file, i) => (
                    <li key={i} className="flex items-center justify-between rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm">
                      <span className="truncate text-slate-300">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => setDocs((prev) => prev.filter((_, idx) => idx !== i))}
                        className="ml-3 shrink-0 text-slate-500 hover:text-red-400 transition-colors"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}

        {error && (
          <div className="rounded-md border border-red-800 bg-red-900/20 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-amber-500 px-6 py-3 text-base font-semibold text-slate-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
        >
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  )
}
