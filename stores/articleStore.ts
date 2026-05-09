import { defineStore } from 'pinia'
import type { Article } from '~/types/database.types'

interface ArticleState {
  items: Article[]
  loading: boolean
  error: string | null
  lastFetched: number | null
}

export const useArticleStore = defineStore('articles', {
  state: (): ArticleState => ({
    items: [],
    loading: false,
    error: null,
    lastFetched: null,
  }),

  getters: {
    getArticleById: (state) => {
      return (id: string | number): Article | undefined =>
        state.items.find((item) => item.id === Number(id))
    },

    // ✅ Raw lookup — use only in admin context
    getArticleBySlug: (state) => {
      return (slug: string): Article | undefined =>
        state.items.find((item) => item.slug === slug)
    },

    // ✅ Safe public lookup — respects published state & scheduling
    getPublishedArticleBySlug: (state) => {
      return (slug: string): Article | undefined => {
        const now = new Date()
        return state.items.find((item) => {
          if (item.slug !== slug) return false
          if (!item.is_published) return false
          if (item.scheduled_from && new Date(item.scheduled_from) > now) return false
          if (item.scheduled_to && new Date(item.scheduled_to) < now) return false
          return true
        })
      }
    },

    publishedArticles: (state): Article[] => {
      const now = new Date()
      return state.items.filter((a) => {
        if (!a.is_published) return false
        if (a.scheduled_from && new Date(a.scheduled_from) > now) return false
        if (a.scheduled_to && new Date(a.scheduled_to) < now) return false
        return true
      })
    },
  },

  actions: {
    async fetchArticles(force = false): Promise<void> {
      const supabase = useSupabaseClient()
      if (!force && this.lastFetched && Date.now() - this.lastFetched < 5 * 60 * 1000) return

      this.loading = true
      this.error = null
      try {
        const { data, error } = await supabase
          .from('articles')
          // ✅ Omit `content` — too heavy for list views; fetched per-article instead
          .select('id, title, slug, district, category, is_published, scheduled_from, scheduled_to, image_url, created_at')
          .order('created_at', { ascending: false })

        if (error) throw error

        // Merge list metadata into items, preserving any already-fetched full content
        const incoming = (data ?? []) as Article[]
        const merged = incoming.map((fresh) => {
          const existing = this.items.find((i) => i.id === fresh.id)
          return existing?.content ? { ...fresh, content: existing.content } : fresh
        })
        this.items = merged
        this.lastFetched = Date.now()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch articles'
        this.error = message
        console.error('fetchArticles:', message)
      } finally {
        this.loading = false
      }
    },

    async fetchArticleBySlug(slug: string): Promise<void> {
      const supabase = useSupabaseClient()

      // ✅ Skip network hit if we already have full content for this slug
      const cached = this.getPublishedArticleBySlug(slug)
      if (cached?.content) return

      this.loading = true
      this.error = null
      try {
        const now = new Date().toISOString()
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('slug', slug)
          .eq('is_published', true)                    // ✅ Never serve drafts publicly
          .or(`scheduled_from.is.null,scheduled_from.lte.${now}`)   // ✅ Not future-scheduled
          .or(`scheduled_to.is.null,scheduled_to.gte.${now}`)       // ✅ Not expired
          .maybeSingle()                               // ✅ Safe — no throw if not found

        if (error) throw error

        if (data) {
          const typed = data as Article
          const index = this.items.findIndex((item) => item.slug === slug)
          if (index !== -1) {
            this.items[index] = typed
          } else {
            this.items.push(typed)
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch article'
        this.error = message
        console.error('fetchArticleBySlug:', message)
      } finally {
        this.loading = false
      }
    },

    // Admin fetch — no published/scheduling filters, full row
    async fetchArticleBySlugAdmin(slug: string): Promise<void> {
      const supabase = useSupabaseClient()
      this.loading = true
      this.error = null
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('slug', slug)
          .maybeSingle()

        if (error) throw error
        if (data) {
          const typed = data as Article
          const index = this.items.findIndex((item) => item.slug === slug)
          if (index !== -1) {
            this.items[index] = typed
          } else {
            this.items.push(typed)
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch article (admin)'
        this.error = message
        console.error('fetchArticleBySlugAdmin:', message)
      } finally {
        this.loading = false
      }
    },

    async forceRefresh(): Promise<void> {
      await this.fetchArticles(true)
    },
  },
})