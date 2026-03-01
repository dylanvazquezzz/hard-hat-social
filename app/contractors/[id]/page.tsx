import { notFound } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import ProfileHeader from '@/components/ProfileHeader'
import CertificationBadge from '@/components/CertificationBadge'
import ContactSection from '@/components/ContactSection'
import type { Contractor, Certification } from '@/lib/types'

interface PageProps {
  params: { id: string }
}

export default async function ContractorProfilePage({ params }: PageProps) {
  const admin = getSupabaseAdmin()
  const [{ data: contractorData }, { data: certData }] = await Promise.all([
    admin
      .from('contractors')
      .select('id, user_id, full_name, trade, specialties, location_city, location_state, years_experience, bio, website, profile_photo_url, status, created_at')
      .eq('id', params.id)
      .eq('status', 'approved')
      .single(),
    admin.from('certifications').select('*').eq('contractor_id', params.id),
  ])

  if (!contractorData) {
    notFound()
  }

  const contractor = contractorData as Omit<Contractor, 'phone' | 'email'>
  const certifications = (certData as Certification[]) ?? []

  return (
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
  )
}
