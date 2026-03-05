import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { notFound } from 'next/navigation'
import { addCertification } from './actions'
import { CertRow } from './CertRow'
import type { Certification } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function ManageCertsPage({ params }: { params: { id: string } }) {
  const admin = getSupabaseAdmin()

  const [contractorRes, certsRes] = await Promise.all([
    admin.from('contractors').select('id, full_name, trade, location_city, location_state').eq('id', params.id).single(),
    admin.from('certifications').select('*').eq('contractor_id', params.id).order('name'),
  ])

  if (!contractorRes.data) notFound()

  const contractor = contractorRes.data
  const certs = (certsRes.data ?? []) as Certification[]

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <a href="/admin/contractors" className="text-sm text-slate-400 hover:text-slate-300">
          ← Back to contractors
        </a>
        <h1 className="mt-4 text-2xl font-bold text-slate-100">{contractor.full_name}</h1>
        <p className="mt-1 text-sm text-slate-400">
          {contractor.trade} · {contractor.location_city}, {contractor.location_state}
        </p>
      </div>

      {/* Existing certs */}
      <div className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Certifications ({certs.length})
        </h2>
        {certs.length === 0 ? (
          <p className="text-sm text-slate-500">No certifications added yet.</p>
        ) : (
          <div className="space-y-2">
            {certs.map((cert) => (
              <CertRow key={cert.id} cert={cert} contractorId={params.id} />
            ))}
          </div>
        )}
      </div>

      {/* Add cert form */}
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Add Certification
        </h2>
        <form
          action={async (formData: FormData) => {
            'use server'
            await addCertification(params.id, formData)
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-400">Name *</label>
              <input
                name="name"
                required
                placeholder="e.g. AWS Certified Welder"
                className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">Issuing Body *</label>
              <input
                name="issuing_body"
                required
                placeholder="e.g. American Welding Society"
                className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">Cert Number</label>
              <input
                name="cert_number"
                placeholder="Optional"
                className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">Expiry Date</label>
              <input
                name="expiry_date"
                type="date"
                className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              name="verified"
              type="checkbox"
              id="verified"
              defaultChecked
              className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500"
            />
            <label htmlFor="verified" className="text-sm text-slate-400">
              Mark as verified
            </label>
          </div>

          <button
            type="submit"
            className="rounded-md bg-amber-500 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400 transition-colors"
          >
            Add Certification
          </button>
        </form>
      </div>
    </div>
  )
}
