<template>
  <div class="manage-section">
    <div class="search-bar">
      <input v-model="searchQuery" type="text" placeholder="Search articles by title…" aria-label="Search articles" />
    </div>

    <ul class="article-list" role="list" aria-label="Articles list">
      <li class="article-row article-row--header" aria-hidden="true">
        <span>Title</span>
        <span>Status</span>
        <span>Actions</span>
      </li>

      <li v-if="filteredArticles.length === 0" class="empty-state">
        No articles found.
      </li>

      <li v-for="article in filteredArticles" :key="article.id" class="article-row">
        <span class="col-title" :title="article.title">{{ article.title }}</span>
        <StatusBadge :status="resolveStatus(article)" />
        <div class="col-actions">
          <button class="btn-sm btn-sm-edit" @click="$emit('edit', article)">Edit</button>
          <NuxtLink :to="`/gate/preview/${article.slug}`" target="_blank" class="btn-sm btn-sm-preview">Preview
          </NuxtLink>
          <button class="btn-sm btn-sm-delete" @click="$emit('delete', article.id)">Delete</button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Article } from '~/types/database.types';

// ─── Sub-component: status badge ─────────────────────────────────────────────

const StatusBadge = defineComponent({
  props: { status: { type: String as PropType<ArticleStatus>, required: true } },
  setup(props) {
    const label: Record<ArticleStatus, string> = {
      published: 'Published',
      draft: 'Draft',
      scheduled: 'Scheduled',
      expired: 'Expired',
    }
    return () =>
      h('span', { class: `status-badge status-badge--${props.status}` }, label[props.status])
  },
})

// ─── Types ────────────────────────────────────────────────────────────────────

type ArticleStatus = 'published' | 'draft' | 'scheduled' | 'expired'

// ─── Props / emits ────────────────────────────────────────────────────────────

const props = defineProps<{
  articles: Article[]
}>()

const emit = defineEmits<{
  'edit': [article: Article]
  'delete': [id: number]
}>()

// ─── Search ───────────────────────────────────────────────────────────────────

const searchQuery = ref<string>('')

const filteredArticles = computed<Article[]>(() =>
  props.articles.filter((a) =>
    a.title?.toLowerCase().includes(searchQuery.value.toLowerCase().trim())
  )
)

// ─── Status resolution ────────────────────────────────────────────────────────

function resolveStatus(article: Article): ArticleStatus {
  const now = new Date()
  const from = article.scheduled_from ? new Date(article.scheduled_from) : null
  const to = article.scheduled_to ? new Date(article.scheduled_to) : null

  if (!article.is_published) return 'draft'
  if (to && now > to) return 'expired'
  if (from && now < from) return 'scheduled'
  return 'published'
}
</script>

<script lang="ts">
import { defineComponent, h } from 'vue'
import type { PropType } from 'vue'
export default defineComponent({ name: 'ManageArticles' })
</script>

<style scoped>
/* ─── Search ──────────────────────────────────────────────────────────────── */

.search-bar {
  margin-bottom: 1.25rem;
}

.search-bar input {
  width: 100%;
  padding: 0.75rem 0.875rem;
  border: 2px solid #edf2f7;
  border-radius: 8px;
  font-family: inherit;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.search-bar input:focus {
  outline: none;
  border-color: #b57b52;
  box-shadow: 0 0 0 3px rgba(181, 123, 82, 0.15);
}

/* ─── List shell ──────────────────────────────────────────────────────────── */

.article-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* ─── Mobile: each row is a card ─────────────────────────────────────────── */

.article-row {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  padding: 1rem;
  border: 1px solid #edf2f7;
  border-radius: 10px;
  background: #fff;
}

.article-row--header {
  display: none;
}

.col-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

@media (min-width: 640px) {
  .col-actions {
    flex-direction: row;
    justify-content: flex-end;
    width: auto;
  }
}

/* ─── Desktop: grid mimics a table ───────────────────────────────────────── */

@media (min-width: 640px) {
  .article-list {
    gap: 0;
    border: 1px solid #edf2f7;
    border-radius: 10px;
    overflow: hidden;
  }

  .article-row {
    display: grid;
    grid-template-columns: 1fr auto auto;
    align-items: center;
    gap: 1rem;
    padding: 0.875rem 1rem;
    border: none;
    border-bottom: 1px solid #edf2f7;
    border-radius: 0;
  }

  .article-row:last-child {
    border-bottom: none;
  }

  .article-row--header {
    display: grid;
    background: #fdfcf8;
    border-bottom: 2px solid #edf2f7;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #718096;
  }

  .col-title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

/* ─── Empty state ─────────────────────────────────────────────────────────── */

.empty-state {
  text-align: center;
  color: #a0aec0;
  font-style: italic;
  padding: 2.5rem 1rem;
}

/* ─── Status badges ───────────────────────────────────────────────────────── */

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.625rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.status-badge--published {
  background: #f0fff4;
  color: #276749;
}

.status-badge--draft {
  background: #f7fafc;
  color: #718096;
}

.status-badge--scheduled {
  background: #ebf8ff;
  color: #2b6cb0;
}

.status-badge--expired {
  background: #fff5f5;
  color: #c53030;
}
</style>