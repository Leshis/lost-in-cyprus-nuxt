<template>
  <div class="page">

    <!-- ─── Hero Video Section ──────────────────────────────────────────── -->
    <section class="hero">
      <!-- Poster/fallback: swap src for your real image when ready -->
      <div class="hero-fallback" />

      <video
        ref="videoEl"
        class="hero-video"
        autoplay
        muted
        loop
        playsinline
        preload="none"
        poster=""
      >
        <!-- Swap this src for your Supabase bucket URL when ready -->
        <!-- <source src="https://YOUR_PROJECT.supabase.co/storage/v1/object/public/videos/hero.mp4" type="video/mp4" /> -->
      </video>

      <div class="hero-overlay">
        <h1 class="hero-title">Lost In Cyprus</h1>
        <p class="hero-subtitle">Hidden secrets, untold stories</p>
      </div>
    </section>

    <!-- ─── Map + Content ────────────────────────────────────────────────── -->
    <div class="app-container">
      <aside class="map-section">
        <CyprusMap />
      </aside>

      <main class="content-section">
        <div class="filter-row">
          <button
            v-for="cat in dynamicCategories"
            :key="cat.id"
            class="filter-pill"
            :class="{ active: activeFilter === cat.id }"
            @click="activeFilter = cat.id"
            :aria-pressed="activeFilter === cat.id"
          >
            {{ cat.label }}
          </button>
        </div>

        <h2 class="results-header">
          {{ filteredLocations.length }} Secrets in {{ activeDistrictName }}
        </h2>

        <div v-if="articleStore.loading" class="loading-state">
          <p>Loading Cyprus secrets…</p>
        </div>

        <div v-else-if="filteredLocations.length === 0" class="empty-state">
          <p>No secrets found here yet. Try a different category!</p>
          <button @click="resetFilters">Reset filters</button>
        </div>

        <div v-else class="card-grid">
          <div
            v-for="(loc, index) in filteredLocations"
            :key="loc.id"
            class="location-card"
          >
            <img
              :src="getImageUrl(loc.image_url ?? '')"
              :srcset="getImageSrcset(loc.image_url ?? '')"
              :loading="index === 0 ? 'eager' : 'lazy'"
              sizes="(max-width: 1024px) 100vw, 50vw"
              :alt="loc.title"
              width="400"
              height="160"
              class="card-img"
            />

            <div class="card-content">
              <span class="category-tag">{{ loc.category.replace('_', ' ') }}</span>
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
import { ref, computed, onMounted, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useMapStore } from '@/stores/mapStore'
import { useArticleStore } from '@/stores/articleStore'
import { getImageUrl, getImageSrcset } from '@/utils/supabaseHelpers'
import type { Article } from '~/types/database.types'

interface Category {
  id: string
  label: string
}

const CyprusMap = defineAsyncComponent(() => import('@/components/CyprusMap.vue'))

const CATEGORY_EMOJIS: Record<string, string> = {
  beaches: '🏖️',
  hiking: '🥾',
  wine: '🍷',
  culture: '🏛️',
  archaeology: '🏺',
  gastronomy: '🍲',
  religious: '⛪',
  rural: '🏡',
  diving: '🤿',
  nightlife: '🪩',
  nature: '🌿',
  family: '🎡',
  wellness: '🧘‍♀️',
  hidden_gems: '💎',
}

const mapStore = useMapStore()
const articleStore = useArticleStore()
const router = useRouter()
const activeFilter = ref<string>('all')
const videoEl = ref<HTMLVideoElement | null>(null)

onMounted(() => {
  articleStore.fetchArticles()

  // Only load video on fast connections
  const connection = (navigator as any).connection
  const savingData = connection?.saveData || connection?.effectiveType === '2g'

  if (!savingData && videoEl.value) {
    // Uncomment when your Supabase URL is ready:
    // videoEl.value.src = 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/videos/hero.mp4'
    // videoEl.value.load()
  }
})

const formatCategoryLabel = (cat: string): string => {
  const emoji = CATEGORY_EMOJIS[cat.toLowerCase()] ?? '📍'
  const formattedText = cat
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
  return `${emoji} ${formattedText}`
}

const dynamicCategories = computed<Category[]>(() => {
  const unique = [...new Set(
    articleStore.publishedArticles.map(i => i.category).filter(Boolean)
  )]
  return [
    { id: 'all', label: 'All' },
    ...unique.map(cat => ({ id: cat, label: formatCategoryLabel(cat) })),
  ]
})

const activeDistrictName = computed<string>(() =>
  mapStore.selectedDistrict
    ? mapStore.selectedDistrict.charAt(0).toUpperCase() + mapStore.selectedDistrict.slice(1)
    : 'Cyprus'
)

const filteredLocations = computed<Article[]>(() =>
  articleStore.publishedArticles.filter(loc => {
    const matchDistrict = !mapStore.selectedDistrict || loc.district === mapStore.selectedDistrict
    const matchCategory = activeFilter.value === 'all' || loc.category === activeFilter.value
    return matchDistrict && matchCategory
  })
)

const resetFilters = (): void => {
  activeFilter.value = 'all'
  mapStore.setSelectedDistrict(null)
}

const handleAction = (loc: Article): void => {
  loc.affiliate_url
    ? window.open(loc.affiliate_url, '_blank', 'noopener,noreferrer')
    : router.push(`/articles/${loc.slug}`)
}
</script>

<style scoped>
@media (min-width: 770px) {
  .page {
    padding-top: var(--navbar-height);
  }
}

/* ─── Hero ──────────────────────────────────────────────────────────────── */
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

/* ─── App container ─────────────────────────────────────────────────────── */
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
}

.content-section {
  flex: 1;
  background-color: #f8f6f0;
  overflow-y: auto;
  padding: 20px 16px;
  border-radius: 20px 20px 0 0;
  margin-top: -20px;
  box-shadow: 0 -5px 15px rgba(0, 0, 0, 0.08);
}

/* ─── Filter pills ──────────────────────────────────────────────────────── */
.filter-row {
  display: flex;
  gap: 8px;
  margin: 0 -16px 16px;
  padding: 0 16px 12px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
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
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}

.filter-pill:hover {
  background: rgba(0, 0, 0, 0.06);
}

.filter-pill.active {
  background: #c69f4b;
  color: white;
  border-color: #c69f4b;
}

/* ─── Results header ────────────────────────────────────────────────────── */
.results-header {
  margin: 0 0 16px;
  font-size: 1rem;
  color: #1a1a1a;
}

/* ─── States ────────────────────────────────────────────────────────────── */
.loading-state,
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #666;
  font-style: italic;
}

.empty-state button {
  margin-top: 12px;
  background: #1c2a32;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 8px;
  cursor: pointer;
}

/* ─── Cards ─────────────────────────────────────────────────────────────── */
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
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.card-img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  background-color: #eee;
  transition: transform 0.4s ease;
}

.location-card:hover .card-img { transform: scale(1.05); }

.card-content { padding: 16px; }

.category-tag {
  font-size: 0.7rem;
  text-transform: uppercase;
  color: #c69f4b;
  font-weight: bold;
  letter-spacing: 0.5px;
}

.card-content h3 { margin: 4px 0; color: #1a1a1a; }

.card-content p {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 12px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #eee;
  padding-top: 12px;
}

.card-footer small { text-transform: capitalize; color: #999; }

.action-btn {
  background: #1c2a32;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.56);
}

/* ─── Desktop ───────────────────────────────────────────────────────────── */
@media (min-width: 1024px) {
  .hero {
    height: 50svh;
  }

  .app-container {
    flex-direction: row;
    height: 50dvh;
    overflow: hidden;
  }

  .map-section {
    flex: 0 0 50%;
    height: 100%;
    min-height: unset;
  }

  .content-section {
    flex: 0 0 50%;
    height: 100%;
    border-radius: 0;
    margin-top: 0;
    padding: 30px;
    box-shadow: -5px 0 15px rgba(0, 0, 0, 0.05);
    overflow-y: auto;
  }

  .filter-row {
    margin-left: 0;
    margin-right: 0;
    padding-left: 0;
    padding-right: 0;
  }

  .card-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}
</style>
