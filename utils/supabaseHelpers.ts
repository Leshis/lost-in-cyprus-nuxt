export const getImageUrl = (path: string) => {
  if (!path) return 'https://placehold.jp/24/1c2a32/ffffff/150x150.png?text=LostInCyprus';

  const config = useRuntimeConfig();
  const projectID = (config.public.supabaseUrl as string)
    ?.match(/https:\/\/(.+)\.supabase\.co/)?.[1]
  const bucketName = 'articles';
  if (!projectID) return ''
  return `https://${projectID}.supabase.co/storage/v1/object/public/${bucketName}/${path}`;
};

// Derives the thumbnail path from the main image path
// e.g. "abc123.webp" -> "abc123_thumb.webp"
const toThumbPath = (path: string) => path.replace(/(\.[^.]+)$/, '_thumb$1')

export const getImageSrcset = (path: string) => {
  if (!path) return ''
  const fullUrl  = getImageUrl(path)
  const thumbUrl = getImageUrl(toThumbPath(path))
  if (!fullUrl || !thumbUrl) return ''
  return `${thumbUrl} 400w, ${fullUrl} 800w`
}
