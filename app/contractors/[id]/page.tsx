import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import ProfileHeader from '@/components/ProfileHeader'
import CertificationBadge from '@/components/CertificationBadge'
import ContactSection from '@/components/ContactSection'
import CompletedJobsSection from '@/components/CompletedJobsSection'
import type { Contractor, Certification } from '@/lib/types'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const admin = getSupabaseAdmin()
  const { data } = await admin
    .from('contractors')
    .select('full_name, trade, location_city, location_state, bio, profile_photo_url')
    .eq('id', params.id)
    .eq('status', 'approved')
    .single()

  if (!data) {
    return { title: 'Contractor Not Found | Hard Hat Social' }
  }

  const title = `${data.full_name} — ${data.trade} | Hard Hat Social`
  const description = data.bio
    ? data.bio.slice(0, 155)
    : `${data.trade} contractor in ${data.location_city}, ${data.location_state}. Verified member of Hard Hat Social.`
  const image = data.profile_photo_url ?? '/og-default.png'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: `${data.full_name} — ${data.trade}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}

export default async function ContractorProfilePage({ params }: PageProps) {
  const admin = getSupabaseAdmin()
  const [{ data: contractorData }, { data: certData }, { data: completedJobsData }] = await Promise.all([
    admin
      .from('contractors')
      .select('id, user_id, full_name, trade, specialties, location_city, location_state, years_experience, bio, website, profile_photo_url, status, created_at')
      .eq('id', params.id)
      .eq('status', 'approved')
      .single(),
    admin.from('certifications').select('*').eq('contractor_id', params.id),
    admin
      .from('jobs')
      .select(`
        id, title, trade, location_city, location_state, completed_at,
        gc_contractor:contractors!jobs_gc_contractor_id_fkey(full_name)
      `)
      .eq('hired_contractor_id', params.id)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false }),
  ])

  if (!contractorData) {
    notFound()
  }

  const contractor = contractorData as Omit<Contractor, 'phone' | 'email'>
  const certifications = (certData as Certification[]) ?? []
  const completedJobs = (completedJobsData ?? []) as unknown as Array<{
    id: string
    title: string
    trade: string
    location_city: string | null
    location_state: string | null
    completed_at: string | null
    gc_contractor?: { full_name: string } | null
  }>

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: contractor.full_name,
    jobTitle: contractor.trade,
    address: {
      '@type': 'PostalAddress',
      addressLocality: contractor.location_city,
      addressRegion: contractor.location_state,
      addressCountry: 'US',
    },
    url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://hardhatsocial.net'}/contractors/${contractor.id}`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <ProfileHeader contractor={contractor} />

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {contractor.bio && (
              <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  About
                </h2>
                <p className="leading-relaxed text-slate-300">{contractor.bio}</p>
              </section>
            )}

            {contractor.specialties?.length > 0 && (
              <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Specialties
                </h2>
                <div className="flex flex-wrap gap-2">
                  {contractor.specialties.map((s) => (
                    <span
                      key={s}
                      className="rounded-md bg-slate-800 px-3 py-1 text-sm text-slate-300"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {certifications.length > 0 && (
              <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Certifications
                </h2>
                <div className="space-y-3">
                  {certifications.map((cert) => (
                    <CertificationBadge key={cert.id} certification={cert} />
                  ))}
                </div>
              </section>
            )}

            <CompletedJobsSection jobs={completedJobs} />
          </div>

          <aside className="space-y-4">
            <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
              <dl className="space-y-4">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-slate-500">Trade</dt>
                  <dd className="mt-1 font-semibold text-slate-100">{contractor.trade}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-slate-500">Location</dt>
                  <dd className="mt-1 font-semibold text-slate-100">
                    {contractor.location_city}, {contractor.location_state}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-slate-500">Experience</dt>
                  <dd className="mt-1 font-semibold text-slate-100">
                    {contractor.years_experience} years
                  </dd>
                </div>
              </dl>
            </div>

            <ContactSection contractorId={params.id} />
          </aside>
        </div>
      </div>
    </>
  )
}
