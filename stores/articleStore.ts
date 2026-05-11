import { defineStore } from 'pinia'
import type { Article } from '~/types/database.types'

// ✅ Honest type for list queries that omit content
type ArticleSummary = Omit<Article, 'content'>

const LIST_TTL = 5 * 60 * 1000   // 5 min for full list
const SLUG_TTL = 60 * 1000       // 1 min for individual article cache

interface ArticleState {
  items: Article[]
  loading: boolean
  error: string | null
  lastFetched: number | null
  lastSlugFetched: Record<string, number>  // ✅ Per-slug timestamps
}

export const useArticleStore = defineStore('articles', {
  state: (): ArticleState => ({
    items: [],
    loading: false,
    error: null,
    lastFetched: null,
    lastSlugFetched: {},
  }),

  getters: {
    getArticleById: (state) => {
      return (id: string | number): Article | undefined =>
        state.items.find((item) => item.id === Number(id))
    },

    // Raw lookup — admin context only
    getArticleBySlug: (state) => {
      return (slug: string): Article | undefined =>
        state.items.find((item) => item.slug === slug)
    },

    // Safe public lookup — respects published state & scheduling
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
      if (!force && this.lastFetched && Date.now() - this.lastFetched < LIST_TTL) return

      this.loading = true
      this.error = null
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('id, title, slug, district, category, is_published, scheduled_from, scheduled_to, image_url, created_at')
          .order('created_at', { ascending: false })

        if (error) throw error

        // ✅ O(n) merge — preserve any already-fetched full content
        const existingById = new Map(this.items.map((i) => [i.id, i]))
        const incoming = (data ?? []) as ArticleSummary[]
        this.items = incoming.map((fresh) => {
          const existing = existingById.get(fresh.id)
          return existing?.content ? { ...fresh, content: existing.content } : fresh as Article
        })
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

      // ✅ Time-bounded cache — re-fetch if content might be stale or unpublished
      const lastFetched = this.lastSlugFetched[slug] ?? null
      const cacheIsFresh = lastFetched !== null && Date.now() - lastFetched < SLUG_TTL
      const cached = this.getPublishedArticleBySlug(slug)
      if (cacheIsFresh && cached?.content) return

      this.loading = true
      this.error = null
      try {
        const now = new Date().toISOString()
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('slug', slug)
          .eq('is_published', true)
          .or(`scheduled_from.is.null,scheduled_from.lte.${now}`)
          .or(`scheduled_to.is.null,scheduled_to.gte.${now}`)
          .maybeSingle()

        if (error) throw error

        const index = this.items.findIndex((item) => item.slug === slug)
        if (data) {
          const typed = data as Article
          if (index !== -1) {
            this.items[index] = typed
          } else {
            this.items.push(typed)
          }
        } else if (index !== -1) {
          this.items.splice(index, 1)
        }

        // ✅ Track per-slug fetch time, not the list timestamp
        this.lastSlugFetched[slug] = Date.now()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch article'
        this.error = message
        console.error('fetchArticleBySlug:', message)
      } finally {
        this.loading = false
      }
    },

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
        const index = this.items.findIndex((item) => item.slug === slug)
        if (data) {
          const typed = data as Article
          if (index !== -1) {
            this.items[index] = typed
          } else {
            this.items.push(typed)
          }
        } else if (index !== -1) {
          this.items.splice(index, 1)
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

    // ✅ Call on sign-out to prevent stale auth'd content persisting
    clearCache(): void {
      this.items = []
      this.lastFetched = null
      this.lastSlugFetched = {}
    },
  },
})