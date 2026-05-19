const FALLBACK_IMAGE = 'https://placehold.jp/24/1c2a32/ffffff/150x150.png?text=LostInCyprus'
const DEFAULT_BUCKET = 'articles'

const extractProjectId = (supabaseUrl: string): string | null =>
  supabaseUrl?.match(/https:\/\/(.+)\.supabase\.co/)?.[1] ?? null

const buildStorageBase = (supabaseUrl: string): string | null => {
  const projectId = extractProjectId(supabaseUrl)
  if (!projectId) {
    console.warn('[supabaseHelper] Could not extract project ID from Supabase URL.')
    return null
  }
  return `https://${projectId}.supabase.co/storage/v1/object/public`
}

export const getImageUrl = (
  path: string,
  supabaseUrl: string,
  bucket: string = DEFAULT_BUCKET
): string => {
  if (!path) return FALLBACK_IMAGE

  const base = buildStorageBase(supabaseUrl)
  if (!base) return FALLBACK_IMAGE

  const encodedPath = path.split('/').map(segment => encodeURIComponent(segment)).join('/')
  return `${base}/${bucket}/${encodedPath}`
}
