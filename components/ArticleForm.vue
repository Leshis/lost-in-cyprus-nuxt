<template>
  <form @submit.prevent="$emit('submit')" class="article-form">
    <div class="field">
      <label for="article-title">Article Title</label>
      <input id="article-title" v-model="localForm.title" type="text"
        placeholder="e.g. Hidden Gems of the Akamas Peninsula" required />
    </div>

    <div class="field">
      <label for="article-slug">URL Slug</label>
      <input id="article-slug" v-model="localForm.slug" type="text" placeholder="hidden-gems-akamas-peninsula" required
        @input="$emit('manual-slug')" />
      <span class="hint">The unique URL path (e.g., cyprusguide.com/articles/slug-name)</span>
    </div>

    <div class="form-row">
      <div class="field">
        <label for="article-lat">Latitude</label>
        <input id="article-lat" v-model.number="localForm.lat" type="number" step="any"
          placeholder="34.9823 (e.g. Paphos)" required />
      </div>
      <div class="field">
        <label for="article-long">Longitude</label>
        <input id="article-long" v-model.number="localForm.long" type="number" step="any" placeholder="32.3382"
          required />
      </div>
    </div>

    <div class="form-row">
      <div class="field">
        <label for="article-district">Cyprus District</label>
        <select id="article-district" v-model="localForm.district" required>
          <option value="" disabled>Select a district</option>
          <option v-for="dist in districts" :key="dist" :value="dist">
            {{ dist }}
          </option>
        </select>
      </div>

      <div class="field">
        <label for="article-category">Travel Category</label>
        <select id="article-category" v-model="localForm.category" required>
          <option value="" disabled>Select a category</option>
          <option v-for="cat in categories" :key="cat" :value="cat">
            {{ cat }}
          </option>
        </select>
      </div>
    </div>

    <div class="form-row">
      <div class="field">
        <label>Go Live Date (Optional)</label>
        <input type="datetime-local" v-model="localForm.scheduled_from" />
        <p class="hint">Leave blank for instant publish</p>
      </div>

      <div class="field">
        <label>Expiry Date (Optional)</label>
        <input type="datetime-local" v-model="localForm.scheduled_to" />
        <p class="hint">Leave blank to keep up forever</p>
      </div>
    </div>

    <div class="field">
      <RichTextEditor v-model="localForm.content" />
    </div>

    <div class="field">
      <label for="article-image">
        Featured Image (Beaches, Tavernas, etc.)
        <span v-if="requireImage" class="required-star">*</span>
      </label>
      <input id="article-image" type="file" accept="image/*" :required="requireImage"
        @change="$emit('file-change', $event)" />
    </div>

    <div class="actions">
      <button
        type="button"
        @click="$emit('save-draft')"
        :disabled="uploading"
        class="btn-ghost"
      >
        Save as Draft
      </button>
      <button type="submit" :disabled="uploading" class="btn-primary">
        {{ submitButtonText }}
      </button>

      <button v-if="mode === 'edit'" type="button" @click="$emit('toggle-publish')"
        :class="localForm.is_published ? 'btn-danger' : 'btn-success'" :disabled="uploading">
        {{ localForm.is_published ? 'Unpublish Article' : 'Publish Article' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import type { ArticleFormFields } from '../composables/useArticleForm'

const RichTextEditor = defineAsyncComponent(() => import('./RichTextEditor.vue'))

const props = defineProps<{
  form: ArticleFormFields & { is_published?: boolean } // Ensure your type has this property
  districts: string[]
  categories: string[]
  uploading: boolean
  requireImage: boolean
  mode: 'create' | 'edit'
}>()

const emit = defineEmits<{
  'update:form': [value: ArticleFormFields]
  'submit': []
  'save-draft': []
  'toggle-publish': [] // Updated event name
  'file-change': [event: Event]
  'error': [message: string]
  'manual-slug': []
}>()

// Dynamic button text based on mode and status
const submitButtonText = computed(() => {
  if (props.uploading) return 'Saving changes...'
  return props.mode === 'edit' ? 'Update Article' : 'Publish to Cyprus Guide'
})

const localForm = computed({
  get: () => props.form,
  set: (val) => emit('update:form', val),
})

</script>

<style scoped>
.article-form {
  gap: 1.5rem;
}

.actions {
  display: flex;
  gap: 1rem;
}
</style>