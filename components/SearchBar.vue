<template>
  <!-- NAVBAR VARIANT -->
  <div v-if="variant === 'nav'" class="search-wrapper" ref="searchWrapper">
    <div class="search-bar" :class="{ active: searchOpen }" @click="openSearch">
      <div class="search-icon-btn" aria-label="Search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
      </div>
      <input v-if="searchOpen" ref="searchInput" v-model="searchQuery"
        type="text" placeholder="Search Cyprus..." class="search-input" @keydown.escape="close" />
      <button v-if="searchOpen && searchQuery" class="clear-btn" @click="searchQuery = ''">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>

    <Transition name="dropdown">
      <div v-if="searchOpen && searchQuery" class="search-dropdown">
        <template v-if="searchResults.length > 0">
          <div v-for="result in searchResults" :key="result.id" class="search-result" @click="navigate(result)">
            <img v-if="result.image_url" :src="getImageUrl(result.image_url)" :alt="result.title" class="result-thumb" />
            <div v-else class="result-thumb result-thumb--placeholder" />
            <div class="result-text">
              <span class="result-title">{{ result.title }}</span>
              <span class="result-meta">{{ result.district }} · {{ result.category }}</span>
            </div>
          </div>
        </template>
        <div v-else class="search-empty">No results for "{{ searchQuery }}"</div>
      </div>
    </Transition>
  </div>

  <!-- MENU VARIANT -->
  <div v-else class="search-section">
    <div v-if="!searchOpen" @click="searchOpen = true" class="pill-search-btn">
      🔍 SEARCH
    </div>
    <div v-else class="search-input-wrapper">
      <input v-model="searchQuery" placeholder="Search secrets..." autofocus class="search-field" />
      <div v-if="searchResults.length > 0" class="results-dropdown">
        <div v-for="result in searchResults" :key="result.id" class="result-item" @click="navigate(result)">
          <div class="result-thumb-wrapper">
            <img :src="getImageUrl(result.image_url)" class="result-thumb" alt="Thumbnail" />
          </div>
          <span class="result-title">{{ result.title }}</span>
        </div>
      </div>
      <button class="cancel-search" @click="close">Cancel</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
const supabase = useSupabaseClient()
import { getImageUrl } from '@/utils/supabaseHelpers';

const props = defineProps({
  variant: { type: String, default: 'inline' }
});

const router = useRouter();
const searchOpen = ref(false);
const searchQuery = ref('');
const searchResults = ref([]);
const searchInput = ref(null);
const searchWrapper = ref(null);

let searchTimeout = null;
watch(searchQuery, (q) => {
  clearTimeout(searchTimeout);
  if (q.trim().length < 2) {
    searchResults.value = [];
    return;
  }
  searchTimeout = setTimeout(async () => {
    const { data } = await supabase
      .from('articles')
      .select('*')
      .eq('is_published', true)
      .ilike('title', `%${q}%`)
      .limit(6);
    searchResults.value = data || [];
  }, 300);
});

const navigate = (result) => { router.push(`/articles/${result.slug}`); close(); };
const openSearch = async () => { searchOpen.value = true; await nextTick(); searchInput.value?.focus(); };
const close = () => { searchOpen.value = false; searchQuery.value = ''; searchResults.value = []; };

// Only needed for nav variant
const handleClickOutside = (e) => {
  if (searchWrapper.value && !searchWrapper.value.contains(e.target)) close();
};
onMounted(() => { if (props.variant === 'nav') document.addEventListener('mousedown', handleClickOutside); });
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside));
</script>

<style scoped>
.search-section {
  width: 100%;
  margin-top: 10px;
}

.pill-search-btn {
  background-color: #b57b52;
  color: white;
  border-radius: 40px;
  padding: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
}

.search-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
}

.search-field {
  width: 100%;
  padding: 14px;
  border-radius: 30px;
  border: 2px solid #b57b52;
  outline: none;
  text-align: center;
  font-size: 1rem;
}

.results-dropdown {
  background: white;
  border: 1px solid #eee;
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  max-height: 250px;
  overflow-y: auto;
  margin-top: 8px;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 15px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
}

.result-thumb-wrapper {
  width: 45px;
  height: 45px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  background: #eee;
}

.result-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.result-title {
  font-size: 0.95rem;
  font-weight: 500;
  color: #1c2a32;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cancel-search {
  background: none;
  border: none;
  color: #888;
  font-size: 0.8rem;
  cursor: pointer;
}

/* ── Search ───────────────────────────── */
.search-wrapper {
  position: relative;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  padding: 0 6px 0 10px;
  height: 38px;
  transition:
    width 0.3s ease,
    border-color 0.2s,
    background 0.2s;
  width: 38px;
  overflow: hidden;
}

.search-bar:hover {
  background: var(--color-copper);
  border-color: var(--color-copper);
  cursor: pointer;
}

.search-bar:hover .search-icon-btn {
  color: var(--text-offwhite);
}

.search-bar:is(.active):hover .search-icon-btn {
  color: var(--color-text-muted);
}

.search-bar:is(.active):hover {
  background: white;
  border-color: var(--color-gold);
}

.search-bar.active {
  width: 320px;
  border-color: var(--color-gold);
}

.search-icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  padding: 0;
  flex-shrink: 0;
  transition: color 0.2s;
}

.search-input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.875rem;
  color: #1c2a32;
  width: 100%;
  min-width: 0;
}

.search-input::placeholder {
  color: #9ca3af;
}

.clear-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  display: flex;
  align-items: center;
  padding: 4px;
  flex-shrink: 0;
  transition: color 0.2s;
}

.clear-btn:hover {
  color: #6b7280;
}

/* ── Dropdown ─────────────────────────── */
.search-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 320px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.search-result {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  text-decoration: none;
  color: inherit;
  transition: background 0.15s;
  border-bottom: 1px solid #f3f4f6;
}

.search-result:last-child {
  border-bottom: none;
}

.search-result:hover {
  background: #faf9f7;
}

.result-thumb {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.result-thumb--placeholder {
  background: #e5e7eb;
}

.result-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.result-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1c2a32;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-meta {
  font-size: 0.75rem;
  color: #9ca3af;
  text-transform: capitalize;
}

.search-empty {
  padding: 16px;
  font-size: 0.875rem;
  color: #9ca3af;
  text-align: center;
}

/* ── Dropdown transition ──────────────── */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>