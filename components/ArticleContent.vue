<template>
  <div class="article-page">
    <header class="article-hero">
      <img
        v-if="article.image_url"
        :src="getImageUrl(article.image_url)"
        :srcset="getImageSrcset(article.image_url)"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
        :alt="article.title"
        class="hero-bg-img"
        fetchpriority="high"
      />
      <div v-else class="hero-bg-img fallback-bg" />

      <!-- Back button lives in its own bar, separate from the hero text -->
      <nav v-if="!isPreview" class="hero-nav">
        <button @click="$emit('back')" class="back-btn" aria-label="Go back">
          <span class="back-arrow">←</span>
          <span class="back-label">Back</span>
        </button>
      </nav>

      <div class="hero-overlay">
        <span class="category-pill">{{ article.category || 'Category' }}</span>
        <h1>{{ article.title || 'Untitled Secret' }}</h1>
      </div>
    </header>

    <main class="article-body">
      <div class="meta-info">
        <div class="meta-left">
          <span class="district-tag">📍 {{ capitalise(article.district) }}</span>
          <a
            v-if="article.lat && article.long"
            :href="`https://www.google.com/maps?q=${article.lat},${article.long}`"
            target="_blank"
            rel="noopener noreferrer"
            class="map-link"
          >
            🗺 View on Map
          </a>
        </div>
        <span class="date">{{ formatDate(article.created_at) }}</span>
      </div>

      <div class="content-text" v-html="sanitizedContent" />
    </main>
  </div>
</template>

<script setup lang="ts">
import DOMPurify from 'dompurify'
import { computed, onMounted, ref } from 'vue'
import { getImageUrl } from '@/utils/supabaseHelpers'
import { getImageSrcset } from '@/utils/supabaseHelpers'
import type { Article } from '@/types/article';

type PreviewArticle = Omit<Article, 'id' | 'image_url' | 'created_at'> & {
  id?: number
  image_url?: string | null
  created_at?: string
}

const sanitizedContent = ref('')

onMounted(async () => {
  // Dynamically import only on client
  const DOMPurify = (await import('dompurify')).default

  // Move your existing computed logic here
  watchEffect(() => {
    const safe = DOMPurify.sanitize(props.article.content ?? '')
    if (!safe) { sanitizedContent.value = ''; return }
    const parser = new DOMParser()
    const doc = parser.parseFromString(safe, 'text/html')
    doc.querySelectorAll('img').forEach(img => img.setAttribute('loading', 'lazy'))
    sanitizedContent.value = doc.body.innerHTML
  })
})

const props = defineProps<{
  article: PreviewArticle
  isPreview?: boolean
}>()

defineEmits<{
  back: []
}>()

const capitalise = (value?: string): string => {
  if (!value) return 'District'
  return value.charAt(0).toUpperCase() + value.slice(1)
}

const formatDate = (dateString?: string): string => {
  const date = dateString ? new Date(dateString) : new Date()
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<style scoped>
.article-page {
  background: #f8f6f0;
  min-height: 100vh;
}

.article-hero {
  height: 45svh;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end; /* ← was space-between */
  overflow: hidden;
}

.hero-bg-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

.fallback-bg {
  background-color: #1c2a32;
}

.hero-overlay {
  position: relative;
  z-index: 1;
  background: linear-gradient(transparent, rgba(0,0,0,0.78));
  width: 100%;
  padding: 32px 16px 16px;
  color: #fff;
}

.hero-overlay h1 {
  margin: 0;
  font-size: 1.35rem;
  line-height: 1.3;
}

.category-pill {
  display: inline-block;
  margin-bottom: 8px;
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.3);
  color: rgba(255,255,255,0.9);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.article-body {
  padding: 24px 16px 60px;
}

.article-inner {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
}

.meta-info {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 0.85rem;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ddd;
}

.meta-left {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.map-link {
  color: #1c2a32;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.8rem;
  padding: 2px 8px;
  border: 1px solid #1c2a32;
  border-radius: 4px;
  transition: background 0.2s ease, color 0.2s ease;
}

.map-link:hover {
  background: #1c2a32;
  color: #fff;
}

.content-text {
  line-height: 1.85;
  font-size: 1rem;
  color: #2c3e50;
  overflow-wrap: break-word;
  word-break: break-word;
}

@media (min-width: 640px) {
  .article-hero { height: 50svh; }
  .hero-overlay h1 { font-size: 1.7rem; }
  .hero-overlay { padding: 40px 32px 28px; }
  .article-body { padding: 36px 32px 80px; }
  .content-text { font-size: 1.05rem; }
}

@media (min-width: 1024px) {
  .article-hero { height: 60svh; }
  .hero-overlay { padding: 60px 48px 36px; }
  .hero-overlay h1 { font-size: 2.4rem; max-width: 720px; }
  .article-body { padding: 52px 48px 100px; }
  .content-text { font-size: 1.1rem; }
}
</style>