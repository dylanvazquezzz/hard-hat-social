export type ContractorStatus = 'pending' | 'approved' | 'rejected'

export interface Contractor {
  id: string
  user_id: string | null
  full_name: string
  trade: string
  specialties: string[]
  location_city: string
  location_state: string
  years_experience: number
  bio: string
  phone: string
  email: string
  website: string | null
  profile_photo_url: string | null
  status: ContractorStatus
  created_at: string
}

export interface Certification {
  id: string
  contractor_id: string
  name: string
  issuing_body: string
  cert_number: string | null
  expiry_date: string | null
  verified: boolean
  document_url: string
}

export interface Application {
  id: string
  user_id: string | null
  submitted_at: string
  status: ContractorStatus
  full_name: string
  trade: string
  specialties: string[]
  location_city: string
  location_state: string
  years_experience: number
  bio: string
  phone: string
  email: string
  website: string | null
  document_urls: string[]
}

export interface Profile {
  id: string
  username: string
  avatar_url: string | null
  updated_at: string
}

export interface Post {
  id: string
  user_id: string
  contractor_id: string | null
  content: string
  image_url: string | null
  link_url: string | null
  category: 'social' | 'qa' | 'jobs'
  created_at: string
  // joined
  profiles?: Profile
  contractors?: { full_name: string; trade: string; location_city: string; location_state: string }
}
