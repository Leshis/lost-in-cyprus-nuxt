import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  const { data, error } = await client
    .from('articles')
    .select('id, title, slug, category, district, image_url, alt_text, affiliate_url')
    .order('created_at', { ascending: false })

  if (error) throw createError({ statusCode: 500, message: error.message })

  return data
})

