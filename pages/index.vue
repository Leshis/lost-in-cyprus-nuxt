<template>
  <div class="page">

    <section class="hero" aria-label="Hero banner">
      <div class="hero-fallback" aria-hidden="true" />

      <video
        ref="videoEl"
        class="hero-video"
        muted
        loop
        playsinline
        preload="none"
        poster="/hero-placeholder.webp"
        aria-hidden="true"
      >
        </video>

      <div class="hero-overlay">
        <h1 class="hero-title">Lost In Cyprus</h1>
        <p class="hero-subtitle">Hidden secrets, untold stories</p>
      </div>
    </section>

    <div class="app-container">
      <aside class="map-section" aria-label="District map">
        <CyprusMap />
      </aside>

      <main id="main-content" class="content-section">

        <nav class="filter-row" aria-label="Filter by category">
          <button
            v-for="cat in dynamicCategories"
            :key="cat.id"
            class="filter-pill"
            :class="{ active: activeFilter === cat.id }"
            :aria-pressed="activeFilter === cat.id"
            @click="setFilter(cat.id)"
          >
            {{ cat.label }}
          </button>
        </nav>

        <h2 class="results-header" aria-live="polite" aria-atomic="true">
          {{ filteredLocations.length }} Secrets in {{ activeDistrictName }}
        </h2>

        <div v-if="pending" class="card-grid loading-state" aria-busy="true" aria-label="Loading secrets">
          <div v-for="n in 4" :key="n" class="skeleton-card" />
        </div>

        <div v-else-if="error" class="empty-state" role="alert">
          <p>Failed to load articles. Please try again.</p>
          <button class="state-btn" @click="refresh()">Retry</button>
        </div>

        <div v-else-if="filteredLocations.length === 0" class="empty-state">
          <p>No secrets found here yet. Try a different category!</p>
          <button class="state-btn" @click="resetFilters">Reset filters</button>
        </div>

        <ul v-else class="card-grid" role="list">
          <li
            v-for="(loc, index) in filteredLocations"
            :key="loc.id"
            v-memo="[loc.id, activeFilter, mapStore.selectedDistrict]"
          >
            <NuxtLink
              :to="`/articles/${loc.slug}`"
              class="card-link"
              :prefetch="index < 6"
            >
              <article class="location-card">
                <div class="card-img-wrap">
                  <NuxtImg
                    :src="`supabase/${loc.image_url}`"
                    :alt="loc.alt_text || loc.title"
                    :loading="index === 0 ? 'eager' : 'lazy'"
                    :fetchpriority="index === 0 ? 'high' : 'auto'"
                    :preload="index === 0"
                    format="webp"
                    quality="80"
                    densities="1x 2x"
                    width="400"
                    height="160"
                    sizes="xs:100vw sm:100vw md:50vw lg:400px"
                    class="card-img"
                  />
                </div>

                <div class="card-content">
                  <span class="category-tag">{{ loc.category.replace(/_/g, ' ') }}</span>
                  <h3 class="card-title">{{ loc.title }}</h3>

                  <div class="card-footer">
                    <small class="card-district">{{ loc.district }}</small>
                    <span class="action-btn" aria-hidden="true">Read More</span>
                  </div>
                </div>
              </article>
            </NuxtLink>
          </li>
        </ul>

      </main>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, shallowRef, onMounted, onBeforeUnmount } from 'vue'
import { useMapStore } from '@/stores/mapStore'
import CyprusMap from '@/components/CyprusMap.vue'
import type { Article } from '~/types/database.types'

definePageMeta({ key: 'home' })

type ArticleCard = Pick<Article,
  'id' | 'title' | 'slug' | 'category' | 'district' | 'image_url' | 'alt_text'
>

interface Category { id: string; label: string }

const CATEGORY_EMOJIS = new Map<string, string>([
  ['beaches', '🏖️'],
  ['hiking', '🥾'],
  ['wine', '🍷'],
  ['culture', '🏛️'],
  ['archaeology', '🏺'],
  ['gastronomy', '🍲'],
  ['religious', '⛪'],
  ['rural', '🏡'],
  ['diving', '🤿'],
  ['nightlife', '🪩'],
  ['nature', '🌿'],
  ['family', '🎡'],
  ['wellness', '🧘‍♀️'],
  ['hidden_gems', '💎']
])

const mapStore = useMapStore()
const activeFilter = ref<string>('all')
const videoEl = shallowRef<HTMLVideoElement | null>(null)

const nuxtApp = useNuxtApp()

const { data: articles, pending, error, refresh } = await useFetch<ArticleCard[]>('/api/articles', {
  key: 'home-articles',
  getCachedData: (key) => {
    if (nuxtApp.payload.data[key]) return nuxtApp.payload.data[key]
    const staticData = (nuxtApp.static as Record<string, any>)?.data
    return staticData ? staticData[key] : undefined
  },
  transform: (raw) => raw ?? [],
  default: (): ArticleCard[] => []
})

const labelCache = new Map<string, string>()

function buildLabel(cat: string): string {
  if (labelCache.has(cat)) return labelCache.get(cat)!
  const emoji = CATEGORY_EMOJIS.get(cat.toLowerCase()) ?? '📍'
  const text = cat.split('_').filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  const label = `${emoji} ${text}`
  labelCache.set(cat, label)
  return label
}

const dynamicCategories = computed<Category[]>(() => {
  const seen = new Set<string>()
  const cats: Category[] = [{ id: 'all', label: 'All' }]
  for (const a of articles.value ?? []) {
    if (a.category && !seen.has(a.category)) {
      seen.add(a.category)
      cats.push({ id: a.category, label: buildLabel(a.category) })
    }
  }
  return cats
})

const activeDistrictName = computed<string>(() => {
  const d = mapStore.selectedDistrict
  return d ? d.charAt(0).toUpperCase() + d.slice(1) : 'Cyprus'
})

const filteredLocations = computed<ArticleCard[]>(() => {
  const district = mapStore.selectedDistrict
  const category = activeFilter.value
  
  if (!district && category === 'all') return articles.value ?? []
  
  return (articles.value ?? []).filter(loc => {
    if (district && loc.district !== district) return false
    if (category !== 'all' && loc.category !== category) return false
    return true
  })
})

const setFilter = (id: string) => { activeFilter.value = id }

const resetFilters = () => {
  activeFilter.value = 'all'
  mapStore.setSelectedDistrict(null)
}

let videoObserver: IntersectionObserver | null = null

onMounted(() => {
  const el = videoEl.value
  if (!el) return

  if (!('IntersectionObserver' in window)) {
    el.play().catch(() => {})
    return
  }

  videoObserver = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (!entry) return
      
      if (entry.isIntersecting) {
        el.play().catch(() => {})
      } else {
        el.pause()
      }
    },
    { threshold: 0.25 }
  )
  videoObserver.observe(el)
})

onBeforeUnmount(() => {
  videoObserver?.disconnect()
  videoObserver = null
})

const SITE_URL = 'https://lostincyprus.com'

useSeoMeta({
  title: 'Lost In Cyprus — Hidden secrets and untold stories',
  ogTitle: 'Lost In Cyprus',
  description: 'Discover hidden beaches, abandoned villages, archaeology, hiking trails and untold stories across Cyprus.',
  ogDescription: 'Discover hidden beaches, abandoned villages, archaeology, hiking trails and untold stories across Cyprus.',
  ogType: 'website',
  ogUrl: SITE_URL,
  ogImage: `${SITE_URL}/og-image.jpg`,
  twitterCard: 'summary_large_image',
  twitterTitle: 'Lost In Cyprus',
  twitterDescription: 'Hidden secrets and untold stories across Cyprus.',
  twitterImage: `${SITE_URL}/og-image.jpg`
})

useHead({
  htmlAttrs: { lang: 'en' },
  link: [
    { rel: 'canonical', href: SITE_URL },
    { rel: 'preconnect', href: 'https://your-project.supabase.co' }
  ]
})
</script>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

@media (min-width: 770px) {
  .page { padding-top: var(--navbar-height); }
}

.hero {
  position: relative;
  height: 45svh;
  min-height: 260px;
  overflow: hidden;
  background-color: var(--color-navy);
  contain: layout paint;
}

.hero-fallback {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--color-navy) 0%, #2d4a3e 50%, var(--color-gold-muted) 100%);
}

.hero-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  will-change: transform;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgb(0 0 0 / 0.15) 0%, rgb(0 0 0 / 0.5) 100%);
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
  color: var(--text-offwhite);
  letter-spacing: -0.02em;
  margin: 0 0 8px;
  text-shadow: 0 2px 12px rgb(0 0 0 / 0.4);
}

.hero-subtitle {
  color: rgb(255 255 255 / 0.85);
  margin: 0;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  font-size: 0.85rem;
}

.app-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: var(--bg-warm-light);
}

.map-section {
  height: 45svh;
  min-height: 280px;
  background-color: var(--bg-warm-light);
  display: flex;
  align-items: center;
  justify-content: center;
  isolation: isolate;
}

.content-section {
  flex: 1;
  background-color: var(--bg-warm);
  overflow-y: auto;
  scrollbar-gutter: stable;
  padding: 20px 16px;
  border-radius: 20px 20px 0 0;
  margin-top: -20px;
  box-shadow: 0 -5px 15px rgb(0 0 0 / 0.08);
}

.filter-row {
  display: flex;
  gap: 8px;
  margin: 0 -16px 16px;
  padding: 0 16px 12px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  overscroll-behavior-x: contain;
}
.filter-row::-webkit-scrollbar { display: none; }

.filter-pill {
  flex-shrink: 0;
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid var(--border-light);
  background: white;
  white-space: nowrap;
  cursor: pointer;
  font-size: 0.9rem;
  touch-action: manipulation;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}
.filter-pill:hover { background: rgb(0 0 0 / 0.06); }
.filter-pill:focus-visible {
  outline: 2px solid var(--color-gold);
  outline-offset: 2px;
}
.filter-pill.active {
  background: var(--color-gold);
  color: white;
  border-color: var(--color-gold);
}

.results-header {
  margin: 0 0 16px;
  font-size: 1rem;
  color: var(--text-primary);
}

.loading-state { pointer-events: none; }

.skeleton-card {
  height: 220px;
  border-radius: 12px;
  background: linear-gradient(
    90deg,
    var(--bg-warm-light) 25%,
    var(--border-light) 50%,
    var(--bg-warm-light) 75
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-card { animation: none; }
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-style: italic;
}

.state-btn {
  margin-top: 12px;
  background: var(--color-navy);
  color: var(--text-offwhite);
  border: none;
  padding: 8px 20px;
  border-radius: 8px;
  cursor: pointer;
  touch-action: manipulation;
  transition: opacity 0.2s;
}
.state-btn:hover { opacity: 0.8; }

.card-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  padding-bottom: 40px;
  list-style: none;
  margin: 0;
  padding-inline: 0;
}

.card-link {
  display: block;
  text-decoration: none;
  color: inherit;
  border-radius: 12px;
}
.card-link:focus-visible {
  outline: 2px solid var(--color-gold);
  outline-offset: 3px;
}

.location-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgb(0 0 0 / 0.05);
  contain: layout;
  content-visibility: auto;
  contain-intrinsic-size: 0 220px;
}

.card-img-wrap { overflow: hidden; }

.card-img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  background-color: var(--bg-warm);
  aspect-ratio: 400 / 160;
  display: block;
  transition: transform 0.4s ease;
}

@media (prefers-reduced-motion: no-preference) {
  .location-card:hover .card-img { transform: scale(1.05); }
}

.card-content { padding: 16px; }

.category-tag {
  font-size: 0.7rem;
  text-transform: uppercase;
  color: var(--color-gold);
  font-weight: bold;
  letter-spacing: 0.5px;
}

.card-title {
  margin: 4px 0;
  color: var(--text-primary);
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--border-light);
  padding-top: 12px;
  margin-top: 8px;
}

.card-district {
  text-transform: capitalize;
  color: var(--text-muted);
}

.action-btn {
  background: var(--color-navy);
  color: var(--text-offwhite);
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.8rem;
  transition: background 0.2s;
  pointer-events: none;
}
.location-card:hover .action-btn { background: rgb(0 0 0 / 0.56); }

@media (min-width: 1024px) {
  .hero { height: 50svh; }

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
    box-shadow: -5px 0 15px rgb(0 0 0 / 0.05);
    overflow-y: auto;
  }

  .filter-row {
    margin-inline: 0;
    padding-inline: 0;
  }

  .card-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}

@media print {
  .hero-video,
  .filter-row,
  .map-section { display: none; }
  .content-section { overflow: visible; }
}
</style>