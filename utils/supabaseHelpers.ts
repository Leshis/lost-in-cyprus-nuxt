// CRITICAL: You MUST have the 'export' keyword here
export const getImageUrl = (path: string) => {
  if (!path) return 'https://placehold.jp/24/1c2a32/ffffff/150x150.png?text=LostInCyprus';

  const projectID = import.meta.env.VITE_SUPABASE_URL
    ?.match(/https:\/\/(.+)\.supabase\.co/)?.[1]
  const bucketName = 'articles'; 

  if (!projectID) return ''
  return `https://${projectID}.supabase.co/storage/v1/object/public/${bucketName}/${path}`;
};

export const getImageSrcset = (path: string) => {
  const base = getImageUrl(path)
  if (!base) return ''
  return `${base}?width=400 400w, ${base}?width=800 800w, ${base}?width=1200 1200w`
}