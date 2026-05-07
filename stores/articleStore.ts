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
      return (id: string | number): Article | undefined => {
        return state.items.find((item) => item.id === Number(id))
      }
    },

    getArticleBySlug: (state) => {
      return (slug: string): Article | undefined =>
        state.items.find((item) => item.slug === slug)
    },

    publishedArticles: (state): Article[] => {
      const now = new Date()
      return state.items.filter((a) => {
        if (!a.is_published) return false
        if (a.scheduled_to && new Date(a.scheduled_to) < now) return false
        if (a.scheduled_from && new Date(a.scheduled_from) > now) return false
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
          .select('id, title, slug, district, category, is_published, scheduled_from, scheduled_to, image_url, created_at')
          .order('created_at', { ascending: false })

        if (error) throw error
        this.items = (data ?? []) as Article[]
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
      this.loading = true
      this.error = null
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('slug', slug)
          .single()

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
      this.lastFetched = null
      await this.fetchArticles(true)
    },
  },
})