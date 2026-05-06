<template>
  <div class="admin-wrap">
    <header class="admin-header">
      <div class="tabs">
        <button :class="{ active: activeTab === 'list' }" @click="switchToList">
          Manage Articles
        </button>
        <button :class="{ active: activeTab === 'create' }" @click="switchToCreate">
          New Article
        </button>
        <button @click="handleLogout" class="logout-tab">Logout</button>
      </div>
    </header>

    <ArticleList
      v-if="activeTab === 'list'"
      :articles="articles"
      @delete="openDeleteModal"
      @edit="handleEditAndSwitch"
    />

    <div v-else class="admin-editor-layout">
      <div class="create-section">
        <p v-if="editingId" class="editing-banner">
          ✏️ Editing article —
          <button class="link-btn" @click="resetForm">cancel and create new</button>
        </p>

        <ArticleForm
          :key="editingId || 'new-article'"
          v-model:form="form"
          :mode="editingId ? 'edit' : 'create'"
          :districts="districts"
          :categories="categories"
          :uploading="uploading"
          :require-image="!editingId"
          @submit="uploadArticle(true)"
          @save-draft="uploadArticle(false)"
          @file-change="handleFileChange"
          @error="handleFormError"
          @toggle-publish="handleTogglePublish"
          @manual-slug="isSlugCustom = true"
        />

        <p v-if="statusMsg" :class="['feedback', isError ? 'error' : 'success']">
          {{ statusMsg }}
        </p>
      </div>

      <aside class="live-preview-section">
        <div class="preview-sticky-wrapper">
          <div class="preview-badge">Live Preview</div>
          <div class="preview-window">
            <ArticleContent :article="form" :isPreview="true" />
          </div>
        </div>
      </aside>
    </div>

    <ConfirmModal
      :isOpen="isModalOpen"
      :title="articleToDelete?.title || 'this article'"
      :is-loading="isDeleting"
      @confirm="executeDelete"
      @cancel="closeModal"
    />
    <p v-if="deleteError" class="feedback error">{{ deleteError }}</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'gate',
})
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminArticles } from '@/composables/useAdminArticles'
import { useArticleForm } from '@/composables/useArticleForm'
import { useDeleteModal } from '@/composables/useDeleteModal'
import ArticleContent from '@/components/ArticleContent.vue'
import ArticleList from '@/components/ArticleList.vue'
import ArticleForm from '@/components/ArticleForm.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import type { Article } from '@/types/article'

useHead({
  title: 'Admin',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})

const supabase = useSupabaseClient()
const router = useRouter()
const activeTab = ref<'list' | 'create'>('list')

const { articles, categories, districts, fetchArticles } = useAdminArticles()

const {
  form, isSlugCustom, uploading, statusMsg, isError, editingId,
  resetForm, handleEdit, handleFileChange, handleFormError, uploadArticle, handleTogglePublish
} = useArticleForm(fetchArticles)

const {
  isModalOpen,
  articleToDelete,
  deleteError,
  isDeleting,
  openDeleteModal,
  closeModal,
  executeDelete,
} = useDeleteModal(articles)

const switchToList = () => {
  resetForm()
  activeTab.value = 'list'
  statusMsg.value = ''
}

const switchToCreate = () => {
  resetForm()
  activeTab.value = 'create'
}

const handleEditAndSwitch = (article: Article) => {
  handleEdit(article)
  activeTab.value = 'create'
}

const handleLogout = async () => {
  await supabase.auth.signOut()
  router.push('/login')
}
</script>

<style scoped>
.admin-wrap {
  max-width: 1600px;
  padding: 2rem;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.tabs {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  width: 100%;
}

.tabs button {
  padding: 0.6rem 1.4rem;
  border: 1.5px solid #d4b896;
  background: white;
  color: #b57b52;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
  white-space: nowrap;
}

.tabs button:hover {
  background: #fdf6f0;
  border-color: #b57b52;
}

.tabs button.active {
  background: #b57b52;
  color: white;
  border-color: #b57b52;
}

.logout-tab {
  margin-left: auto;
}

.admin-editor-layout {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 30px;
}

.create-section {
  flex: 1;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.live-preview-section {
  flex: 1;
}

.preview-sticky-wrapper {
  position: sticky;
  top: 20px;
}

.preview-badge {
  background: #333;
  color: white;
  display: inline-block;
  padding: 4px 12px;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-radius: 4px 4px 0 0;
}

.preview-window {
  background: white;
  border-radius: 12px;
  max-height: 90dvh;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
  min-height: 600px;
  overflow-y: auto;
}

.editing-banner {
  background: #fff8e1;
  border: 1px solid #ffe082;
  border-radius: 6px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #5d4037;
}

.link-btn {
  background: none;
  border: none;
  color: #b57b52;
  cursor: pointer;
  font-weight: 600;
  padding: 0;
  text-decoration: underline;
}

@media (max-width: 600px) {
  .tabs button {
    padding: 0.5rem 0.85rem;
    font-size: 0.8rem;
  }
}

@media (max-width: 1100px) {
  .live-preview-section {
    display: none;
  }

  .admin-editor-layout {
    display: block;
  }
}
</style>