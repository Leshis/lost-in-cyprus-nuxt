export interface Article {
  id: number
  title: string
  slug: string
  district: string
  content: string
  category: string
  image_url: string | null
  created_at: string
  lat?: number | null
  long?: number | null
  is_published: boolean
  scheduled_from: string | null
  scheduled_to: string | null
  affiliate_url: string | null
  location?: string
}