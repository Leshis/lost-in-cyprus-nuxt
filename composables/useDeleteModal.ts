import { ref } from 'vue'
import type { Article } from '@/types/article'

export function useDeleteModal(articles: import('vue').Ref<Article[]>) {
  const supabase = useSupabaseClient()
  const isModalOpen = ref(false)
  const articleToDelete = ref<Article | null>(null)
  const deleteError = ref<string | null>(null) // was missing — failures were silent
  const isDeleting = ref(false)

  const openDeleteModal = (id: number) => {
    articleToDelete.value = articles.value.find(a => a.id === id) ?? null
    deleteError.value = null
    isModalOpen.value = true
  }

  const closeModal = () => {
    isModalOpen.value = false
    articleToDelete.value = null
    deleteError.value = null
  }

  // Add this helper inside useArticleForm
  const deleteImageFromStorage = async (path: string) => {
    try {
      const { error } = await supabase.storage
        .from('articles')
        .remove([path]) // remove() expects an array of paths

      if (error) console.error('Storage cleanup failed:', error.message)
    } catch (err) {
      console.error('Storage error:', err)
    }
  }

  const executeDelete = async () => {
    if (!articleToDelete.value) return

    isDeleting.value = true
    try {
      const { id } = articleToDelete.value
      const { error } = await supabase.from('articles').delete().eq('id', id)

      if (error) {
        console.error('Delete failed:', error.message)
        deleteError.value = 'Failed to delete article. Please try again.'
        return
      }

      if (articleToDelete.value?.image_url) {
        await deleteImageFromStorage(articleToDelete.value.image_url)
      }

      articles.value = articles.value.filter(a => a.id !== id)
      closeModal()
    } finally {
      isDeleting.value = false
    }
  }

  return { isModalOpen, articleToDelete, deleteError, isDeleting, openDeleteModal, closeModal, executeDelete }
}