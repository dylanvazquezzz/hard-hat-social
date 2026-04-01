import type { MetadataRoute } from 'next'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://hardhatsocial.net'

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${base}/contractors`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${base}/apply`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${base}/explore`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.7,
    },
    {
      url: `${base}/jobs`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.7,
    },
    // Trade landing pages
    ...([
      'welding-contractors',
      'hvac-contractors',
      'electrical-contractors',
      'plumbing-contractors',
      'general-contractors',
      'drywall-contractors',
      'about',
      'guides/find-welding-subcontractor',
    ] as const).map((slug) => ({
      url: `${base}/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]

  // Dynamic contractor profile routes
  try {
    const admin = getSupabaseAdmin()
    const { data: contractors } = await admin
      .from('contractors')
      .select('id, created_at')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(1000)

    const contractorRoutes: MetadataRoute.Sitemap = (contractors ?? []).map((c) => ({
      url: `${base}/contractors/${c.id}`,
      lastModified: new Date(c.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

    return [...staticRoutes, ...contractorRoutes]
  } catch {
    // If DB is unavailable at build time, return static routes only
    return staticRoutes
  }
}
