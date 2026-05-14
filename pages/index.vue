<template>
  <div class="page">
    <section class="hero" v-once>
      <div class="hero-fallback" />
      <video
        ref="videoEl"
        class="hero-video"
        autoplay muted loop playsinline
        preload="none"
        poster=""
      />
      <div class="hero-overlay">
        <h1 class="hero-title">Lost In Cyprus</h1>
        <p class="hero-subtitle">Hidden secrets, untold stories</p>
      </div>
    </section>
    <div class="app-container">
      <aside class="map-section">
        <Suspense>
          <CyprusMap />
          <template #fallback>
            <div class="map-skeleton" aria-hidden="true" />
          </template>
        </Suspense>
      </aside>

      <main class="content-section">
        <div class="filter-row" role="group" aria-label="Category filter">
          <button
            v-for="cat in dynamicCategories"
            :key="cat.id"
            class="filter-pill"
            :class="{ active: activeFilter === cat.id }"
            @click="setFilter(cat.id)"
            :aria-pressed="activeFilter === cat.id"
          >
            {{ cat.label }}
          </button>
        </div>

        <h2 class="results-header">
          {{ filteredLocations.length }} Secrets in {{ activeDistrictName }}
        </h2>

        <div v-if="fetchError || articleStore.error" class="error-state">
          <p>Failed to load secrets. Please try again later.</p>
          <button @click="resetFilters">Reset filters</button>
        </div>

        <div v-else-if="filteredLocations.length === 0" class="empty-state">
          <p>No secrets found here yet. Try a different category!</p>
          <button @click="resetFilters">Reset filters</button>
        </div>

        <div v-else class="card-grid">
          <div
            v-for="(loc, index) in filteredLocations"
            :key="loc.id"
            v-memo="[loc.id, loc.title, loc.image_url, loc._categoryLabel, loc.district, loc.affiliate_url, loc.slug, activeFilter, mapStore.selectedDistrict]"
            class="location-card"
          >
            <img
              :src="getImageUrl(loc.image_url ?? '')"
              :srcset="getImageSrcset(loc.image_url ?? '')"
              :loading="index === 0 ? 'eager' : 'lazy'"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
              :alt="loc.title"
              width="400"
              height="160"
              class="card-img"
              :fetchpriority="index === 0 ? 'high' : 'auto'"
              decoding="async"
            />

            <div class="card-content">
              <span class="category-tag">{{ loc._categoryLabel }}</span>
              <h3>{{ loc.title }}</h3>

              <div class="card-footer">
                <small>{{ loc.district }}</small>
                <button class="action-btn" @click="handleAction(loc)">
                  {{ loc.affiliate_url ? 'Book Now' : 'Read More' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

  </div>
</template>

<script setup lang="ts">
import {
  ref, computed, shallowRef, markRaw,
  onMounted, defineAsyncComponent
} from 'vue'
import { useRouter } from 'vue-router'
import { useMapStore } from '@/stores/mapStore'
import { useArticleStore } from '@/stores/articleStore'
import { getImageUrl, getImageSrcset } from '@/utils/supabaseHelpers'
import type { Article } from '~/types/database.types'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Category { id: string; label: string }
type ArticleWithLabel = Article & { _categoryLabel: string }

// ─── Static data ─────────────────────────────────────────────────────────────

const CATEGORY_EMOJIS: Readonly<Record<string, string>> = Object.freeze({
  beaches: '🏖️', hiking: '🥾', wine: '🍷', culture: '🏛️',
  archaeology: '🏺', gastronomy: '🍲', religious: '⛪', rural: '🏡',
  diving: '🤿', nightlife: '🪩', nature: '🌿', family: '🎡',
  wellness: '🧘‍♀️', hidden_gems: '💎',
})

const formatCategoryLabel = (cat: string): string => {
  const emoji = CATEGORY_EMOJIS[cat.toLowerCase()] ?? '📍'
  const text = cat.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  return `${emoji} ${text}`
}

// ─── Async component ──────────────────────────────────────────────────────────

const CyprusMap = markRaw(
  defineAsyncComponent(() => import('@/components/CyprusMap.vue'))
)

// ─── Stores & router ─────────────────────────────────────────────────────────

const mapStore = useMapStore()
const articleStore = useArticleStore()
const router = markRaw(useRouter())

// ─── Data Fetching (SSR Strategy) ───────────────────────────────────────────

// This fetches the data on the server, ensuring the cards are in the
// initial HTML for that "instant" feel.
const { error: fetchError } = await useAsyncData('init-articles', () => articleStore.fetchArticles())

// ─── Local state ─────────────────────────────────────────────────────────────

const activeFilter = ref<string>('all')
const videoEl = shallowRef<HTMLVideoElement | null>(null)

// ─── Computed ─────────────────────────────────────────────────────────────────

const annotatedArticles = computed<ArticleWithLabel[]>(() =>
  articleStore.publishedArticles.map(a => ({
    ...a,
    _categoryLabel: a.category
      ? a.category.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      : '',
  }))
)

const dynamicCategories = computed<Category[]>(() => {
  const seen = new Set<string>()
  const cats: Category[] = [{ id: 'all', label: 'All' }]
  for (const a of annotatedArticles.value) {
    if (a.category && !seen.has(a.category)) {
      seen.add(a.category)
      cats.push({ id: a.category, label: formatCategoryLabel(a.category) })
    }
  }
  return cats
})

const activeDistrictName = computed<string>(() => {
  const d = mapStore.selectedDistrict
  return d ? d.charAt(0).toUpperCase() + d.slice(1) : 'Cyprus'
})

const filteredLocations = computed<ArticleWithLabel[]>(() => {
  const district = mapStore.selectedDistrict
  const filter = activeFilter.value
  if (!district && filter === 'all') return annotatedArticles.value
  return annotatedArticles.value.filter(loc =>
    (!district || loc.district === district) &&
    (filter === 'all' || loc.category === filter)
  )
})

// ─── Methods ──────────────────────────────────────────────────────────────────

const setFilter = (id: string): void => { activeFilter.value = id }

const resetFilters = (): void => {
  activeFilter.value = 'all'
  mapStore.setSelectedDistrict(null)
}

const handleAction = (loc: Article): void => {
  loc.affiliate_url
    ? window.open(loc.affiliate_url, '_blank', 'noopener,noreferrer')
    : router.push(`/articles/${loc.slug}`)
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

onMounted(() => {
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string }
  }
  const conn = nav.connection
  const savingData = conn?.saveData || conn?.effectiveType === '2g'
  if (!savingData && videoEl.value) {
    // videoEl.value.src = '...'
    // videoEl.value.load()
  }
})
</script>

<style scoped>
@media (min-width: 770px) {
  .page { padding-top: var(--navbar-height); }
}

.hero {
  position: relative;
  height: 45svh;
  min-height: 260px;
  overflow: hidden;
  background-color: #1c2a32;
}

.hero-fallback {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #1c2a32 0%, #2d4a3e 50%, #c69f4b22 100%);
}

.hero-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  will-change: transform;
  transform: translateZ(0); /* */
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.5) 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0 24px;
}

.hero-title {
  font-size: clamp(2rem, 8vw, 3.5rem);
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.02em;
  margin: 0 0 8px;
  text-shadow: 0 2px 12px rgba(0,0,0,0.4);
}

.hero-subtitle {
  color: rgba(255,255,255,0.85);
  margin: 0;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  font-size: 0.85rem;
}

.app-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: #f8f6f0;
}

.map-section {
  height: 45svh;
  min-height: 280px;
  background-color: #fdfcf8;
  display: flex;
  align-items: center;
  justify-content: center;
  contain: strict; /* */
}

.map-skeleton {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #e8e4dc 25%, #f0ece4 50%, #e8e4dc 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

.content-section {
  flex: 1;
  background-color: #f8f6f0;
  padding: 20px 16px;
  border-radius: 20px 20px 0 0;
  margin-top: -20px;
  box-shadow: 0 -5px 15px rgba(0, 0, 0, 0.08);
}

.filter-row {
  display: flex;
  gap: 8px;
  margin: 0 -16px 16px;
  padding: 0 16px 12px;
  overflow-x: auto;
  scrollbar-width: none;
}

.filter-row::-webkit-scrollbar { display: none; }

.filter-pill {
  flex-shrink: 0;
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid #e0e0e0;
  background: white;
  white-space: nowrap;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.filter-pill.active {
  background: #c69f4b;
  color: white;
  border-color: #c69f4b;
}

.card-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  padding-bottom: 40px;
}

.location-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  contain: layout style; /* */
  content-visibility: auto; /* */
  contain-intrinsic-size: 0 260px;
}

.card-img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  background-color: #eee;
  display: block;
}

.card-content { padding: 16px; }

.category-tag {
  font-size: 0.7rem;
  text-transform: uppercase;
  color: #c69f4b;
  font-weight: bold;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #eee;
  padding-top: 12px;
  margin-top: 12px;
}

.action-btn {
  background: #1c2a32;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .map-skeleton {
    animation: none;
    background: #e8e4dc;
  }
}

@media (min-width: 1024px) {
  .hero { height: 50svh; }
  .app-container {
    flex-direction: row;
    height: 50dvh;
    overflow: hidden;
  }
  .map-section { flex: 0 0 50%; height: 100%; }
  .content-section {
    flex: 0 0 50%;
    height: 100%;
    border-radius: 0;
    margin-top: 0;
    overflow-y: auto;
  }
  .card-grid { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }
}
</style>
