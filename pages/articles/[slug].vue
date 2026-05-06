<template>
  <div class="article-page">
    <div v-if="isLoading" class="status-state">
      <div class="spinner" aria-label="Loading article" />
      <p class="status-text">Loading…</p>
    </div>

    <div v-else-if="error" class="status-state error-state">
      <p class="error-message">{{ error }}</p>
      <button class="btn-ghost" @click="loadData(currentSlug)">Try again</button>
    </div>

    <ArticleContent v-else-if="article" :article="article" @back="goBack" />

    <div v-else class="status-state">
      <p class="status-text">Article not found.</p>
      <button class="btn-ghost" @click="goBack">Go back</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useArticleStore } from '@/stores/articleStore'
import ArticleContent from '@/components/ArticleContent.vue'
import { getImageUrl } from '@/utils/supabaseHelpers'

const route = useRoute()
const router = useRouter()
const articleStore = useArticleStore()

const isLoading = ref(false)
const isPreview = route.name === 'ArticlePreview'
const error = ref<string | null>(null)

const currentSlug = computed(() => route.params.slug as string)
const article = computed(() => articleStore.getArticleBySlug(currentSlug.value))

useHead({
  title: () => article.value?.title ?? 'Secret',
  meta: [
    {
      name: 'description',
      content: () =>
        article.value?.content
          ? article.value.content.replace(/<[^>]*>/g, '').slice(0, 155).trimEnd() + '…'
          : 'Discover local secrets',
    },
  ],
  script: [
  {
    type: 'application/ld+json',
    innerHTML: () => JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.value?.title,
      description: article.value?.content?.replace(/<[^>]*>/g, '').slice(0, 155),
      image: article.value?.image_url ? getImageUrl(article.value.image_url) : undefined,
      datePublished: article.value?.created_at,
    }),
  },
],
})

const loadData = async (slug: string) => {
  if (!slug || slug === 'undefined') return
  if (articleStore.getArticleBySlug(slug)) return

  isLoading.value = true
  error.value = null

  try {
    if (isPreview) {
      await articleStore.fetchArticleBySlugAdmin(slug)
    } else {
      await articleStore.fetchArticleBySlug(slug)
    }
  } catch (err) {
    error.value = 'Failed to load this secret. Please try again.'
  } finally {
    isLoading.value = false
  }
}

watch(currentSlug, (slug) => loadData(slug), { immediate: true })

const goBack = () => {
  if (window.history.length > 2) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
/* Outer wrapper — provides the warm background during loading/error states
   before ArticleContent mounts and takes over */
.article-page {
  background: #f8f6f0;
  min-height: 100vh;
}

/* ── Loading / error / not-found states ──────────────────────────────────── */

.status-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  min-height: 60vh;
  padding: 2rem;
  text-align: center;
}

.status-text {
  font-size: 1rem;
  color: #718096;
}

/* CSS spinner */
.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e4dfd5;
  border-top-color: #b57b52;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error state */
.error-state { gap: 1.25rem; }

.error-message {
  font-size: 1rem;
  color: #c62828;
}
</style>