<template>
  <div class="article-page">
    <ArticleContent v-if="article" :article="article" :is-preview="true" />
    <div v-else class="status-state">
      <div class="spinner" />
      <p class="status-text">Loading preview…</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'gate' })

const route = useRoute()
const articleStore = useArticleStore()
const slug = computed(() => route.params.slug as string)
const article = computed(() => articleStore.getArticleBySlug(slug.value))

onMounted(async () => {
  if (!article.value) {
    await articleStore.fetchArticleBySlugAdmin(slug.value)
  }
})
</script>