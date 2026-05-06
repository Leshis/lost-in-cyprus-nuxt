// server/api/__sitemap__/urls.ts
export default defineSitemapEventHandler(async () => {
  const supabase = useSupabaseClient() // server-side client
  const { data } = await supabase
    .from('articles')
    .select('slug')
    .eq('is_published', true)

  return (data ?? []).map(({ slug }) => ({
    loc: `/articles/${slug}`,
  }))
})