<template>
  <div class="rte-wrapper">

    <!-- Toolbar -->
    <div class="rte-toolbar">
      <template v-for="(btn, i) in toolbarButtons" :key="i">
        <div v-if="'type' in btn && btn.type === 'divider'" class="rte-divider" />
        <button
          v-else-if="'cmd' in btn"
          type="button"
          :title="btn.title"
          :class="['rte-btn', btn.cls, { active: activeStates[btn.cmd] }]"
          @mousedown.prevent="execCmd(btn.cmd, btn.value)"
        >
          {{ btn.label }}
        </button>
      </template>

      <!-- Image insert -->
      <div class="rte-divider" />
      <button type="button" title="Insert Image" class="rte-btn" @mousedown.prevent="openImageModal">
        🖼
      </button>

      <!-- HTML toggle -->
      <div class="rte-spacer" />
      <button type="button" :class="['rte-toggle', { active: showHtml }]" @click="showHtml = !showHtml">
        {{ showHtml ? 'EDIT' : 'HTML' }}
      </button>
    </div>

    <!-- Editable area -->
    <div
      v-show="!showHtml"
      ref="editorEl"
      class="rte-editor"
      contenteditable="true"
      data-placeholder="Describe the atmosphere, the food, or how to get there..."
      @input="onInput"
      @keyup="updateStates"
      @mouseup="updateStates"
    />

    <!-- Raw HTML view -->
    <pre v-if="showHtml" class="rte-html">{{ modelValue || '<p></p>' }}</pre>

    <!-- Footer -->
    <div class="rte-footer">
      <span>{{ wordCount }} words</span>
      <span class="rte-footer-right">HTML → DB ready</span>
    </div>

    <!-- Image Modal -->
    <Teleport to="body">
      <div v-if="showImageModal" class="rte-modal-backdrop" @click.self="showImageModal = false">
        <div class="rte-modal">
          <h3>Insert Image</h3>

          <label class="rte-modal-label">Image URL</label>
          <input
            ref="imageUrlInput"
            v-model="imageForm.url"
            type="text"
            placeholder="https://example.com/photo.jpg"
            class="rte-modal-input"
            @keydown.enter="insertImage"
          />

          <label class="rte-modal-label">Alt Text</label>
          <input
            v-model="imageForm.alt"
            type="text"
            placeholder="Describe the image…"
            class="rte-modal-input"
          />

          <label class="rte-modal-label">Alignment</label>
          <div class="rte-align-btns">
            <button
              v-for="a in (['left', 'center', 'right'] as const)"
              :key="a"
              type="button"
              :class="['rte-align-btn', { active: imageForm.align === a }]"
              @click="imageForm.align = a"
            >
              {{ a.charAt(0).toUpperCase() + a.slice(1) }}
            </button>
          </div>

          <img
            v-if="imageForm.url"
            :src="imageForm.url"
            :alt="imageForm.alt"
            class="rte-modal-preview"
            @error="($event.target as HTMLImageElement).style.display = 'none'"
          />

          <div class="rte-modal-actions">
            <button type="button" class="rte-modal-cancel" @click="showImageModal = false">Cancel</button>
            <button type="button" class="rte-modal-insert" :disabled="!imageForm.url" @click="insertImage">
              Insert Image
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import DOMPurify from 'dompurify'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// ── Toolbar types ─────────────────────────────────────────────────────────────

type ToolbarDivider = { type: 'divider' }
type ToolbarButton = {
  cmd: string
  value?: string
  label: string
  title: string
  cls?: string
}
type ToolbarItem = ToolbarDivider | ToolbarButton

const toolbarButtons: ToolbarItem[] = [
  { cmd: 'formatBlock', value: 'h2', label: 'H2',  title: 'Heading 2' },
  { cmd: 'formatBlock', value: 'h3', label: 'H3',  title: 'Heading 3' },
  { cmd: 'formatBlock', value: 'p',  label: '¶',   title: 'Paragraph' },
  { type: 'divider' },
  { cmd: 'bold',                label: 'B',  title: 'Bold',          cls: 'fmt-bold' },
  { cmd: 'italic',              label: 'I',  title: 'Italic',        cls: 'fmt-italic' },
  { cmd: 'underline',           label: 'U',  title: 'Underline',     cls: 'fmt-underline' },
  { cmd: 'strikeThrough',       label: 'S̶',  title: 'Strikethrough' },
  { type: 'divider' },
  { cmd: 'insertUnorderedList', label: '•≡', title: 'Bullet List' },
  { cmd: 'insertOrderedList',   label: '1≡', title: 'Numbered List' },
  { type: 'divider' },
  { cmd: 'justifyLeft',   label: '⬅', title: 'Align Left' },
  { cmd: 'justifyCenter', label: '≡',  title: 'Centre' },
  { cmd: 'justifyRight',  label: '➡', title: 'Align Right' },
]

// ── State ─────────────────────────────────────────────────────────────────────

const editorEl       = ref<HTMLDivElement | null>(null)
const showHtml       = ref(false)
const activeStates   = ref<Record<string, boolean>>({})
const showImageModal = ref(false)
const imageUrlInput  = ref<HTMLInputElement | null>(null)
const savedRange     = ref<Range | null>(null)
const imageForm      = ref({ url: '', alt: '', align: 'left' as 'left' | 'center' | 'right' })

// ── Computed ──────────────────────────────────────────────────────────────────

const wordCount = computed(() => {
  const text = editorEl.value?.innerText || ''
  return text.trim().split(/\s+/).filter(Boolean).length
})

// ── Helpers ───────────────────────────────────────────────────────────────────

function sanitize(html: string) {
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })
}

function updateStates() {
  const cmds = [
    'bold', 'italic', 'underline', 'strikeThrough',
    'insertUnorderedList', 'insertOrderedList',
    'justifyLeft', 'justifyCenter', 'justifyRight',
  ]
  const next: Record<string, boolean> = {}
  cmds.forEach(cmd => {
    try { next[cmd] = document.queryCommandState(cmd) } catch { /* noop */ }
  })
  activeStates.value = next
}

function execCmd(cmd: string, value?: string) {
  editorEl.value?.focus()
  document.execCommand(cmd, false, value)
  emit('update:modelValue', sanitize(editorEl.value?.innerHTML ?? ''))
  updateStates()
}

function onInput() {
  emit('update:modelValue', sanitize(editorEl.value?.innerHTML ?? ''))
  updateStates()
}

function saveSelection() {
  const sel = window.getSelection()
  if (sel?.rangeCount) savedRange.value = sel.getRangeAt(0).cloneRange()
}

function restoreSelection() {
  const sel = window.getSelection()
  if (savedRange.value && sel) {
    sel.removeAllRanges()
    sel.addRange(savedRange.value)
  }
}

function openImageModal() {
  saveSelection()
  imageForm.value = { url: '', alt: '', align: 'left' }
  showImageModal.value = true
  nextTick(() => imageUrlInput.value?.focus())
}

function insertImage() {
  if (!imageForm.value.url.trim()) return
  restoreSelection()
  editorEl.value?.focus()

  const { url, alt, align } = imageForm.value
  const alignClass = align === 'center' ? 'img-center'
    : align === 'right' ? 'img-right'
    : 'img-left'

  document.execCommand(
    'insertHTML', false,
    `<img src="${url}" alt="${alt}" class="rte-inserted-img ${alignClass}" /><span>\u200B</span>`
  )

  showImageModal.value = false
  emit('update:modelValue', sanitize(editorEl.value?.innerHTML ?? ''))
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

onMounted(() => {
  if (editorEl.value && props.modelValue) {
    editorEl.value.innerHTML = props.modelValue
  }
})

watch(
  () => props.modelValue,
  (val) => {
    if (editorEl.value && val === '') {
      editorEl.value.innerHTML = ''
    }
  }
)
</script>

<!-- Global styles: required for dynamically inserted images which don't receive Vue's scoped attribute -->
<style>
.rte-inserted-img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}
.rte-inserted-img.img-left   { float: left;   margin: 0 1.5em 1em 0; }
.rte-inserted-img.img-center { display: block; margin: 1em auto; }
.rte-inserted-img.img-right  { float: right;  margin: 0 0 1em 1.5em; }
</style>

<style scoped>
.rte-wrapper {
  border: 1px solid #d1d1cf;
  border-radius: 8px;
  overflow: hidden;
  background: #fafaf8;
  font-family: 'Georgia', 'Times New Roman', serif;
}

.rte-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px;
  padding: 8px 10px;
  background: #1c1c1a;
  border-bottom: 2px solid #333;
}

.rte-divider {
  width: 1px;
  height: 20px;
  background: #444;
  margin: 0 5px;
  flex-shrink: 0;
}

.rte-spacer { flex: 1; }

.rte-btn {
  background: transparent;
  color: #d0cdc5;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  min-width: 30px;
  cursor: pointer;
  font-size: 13px;
  font-family: 'Georgia', serif;
  line-height: 1.4;
  transition: background 0.1s, color 0.1s;
}
.rte-btn:hover  { background: #2e2e2a; color: #fff; }
.rte-btn.active { background: #c8a96e; color: #1c1c1a; }

/* Toolbar button label formatting — replaces inline styles */
.fmt-bold      { font-weight: 700; }
.fmt-italic    { font-style: italic; }
.fmt-underline { text-decoration: underline; }

.rte-toggle {
  background: #2a2a26;
  color: #888;
  border: none;
  border-radius: 4px;
  padding: 4px 11px;
  cursor: pointer;
  font-size: 11px;
  font-family: monospace;
  letter-spacing: 0.08em;
  transition: background 0.1s, color 0.1s;
}
.rte-toggle.active { background: #c8a96e; color: #1c1c1a; }

.rte-editor {
  min-height: 280px;
  padding: 24px 32px;
  font-size: 16px;
  line-height: 1.8;
  color: #1a1a18;
  background: #fafaf8;
  outline: none;
  overflow-y: auto;
}

.rte-editor:empty::before {
  content: attr(data-placeholder);
  color: #bbb;
  pointer-events: none;
}

.rte-editor :deep(h1) { font-size: 2em;   margin: 0.4em 0 0.2em; line-height: 1.2; }
.rte-editor :deep(h2) { font-size: 1.5em; margin: 0.6em 0 0.2em; line-height: 1.3; }
.rte-editor :deep(h3) { font-size: 1.2em; margin: 0.7em 0 0.2em; line-height: 1.4; }
.rte-editor :deep(p)  { margin: 0.5em 0; }
.rte-editor :deep(ul),
.rte-editor :deep(ol) { padding-left: 1.5em; margin: 0.5em 0; }
.rte-editor :deep(img) { max-width: 100%; }

.rte-html {
  min-height: 280px;
  margin: 0;
  padding: 24px 32px;
  background: #f0efeb;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.7;
  color: #3a7a5a;
  white-space: pre-wrap;
  word-break: break-all;
  overflow-x: auto;
}

.rte-footer {
  display: flex;
  justify-content: space-between;
  padding: 5px 14px;
  background: #f0efeb;
  border-top: 1px solid #e0ddd8;
  font-family: monospace;
  font-size: 11px;
  color: #999;
}
.rte-footer-right { color: #bbb; }

.rte-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.rte-modal {
  background: #fafaf8;
  border-radius: 10px;
  padding: 32px;
  width: 420px;
  max-width: 90vw;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.rte-modal h3 {
  margin: 0 0 20px;
  font-family: 'Georgia', serif;
  font-size: 18px;
  color: #1a1a18;
}

.rte-modal-label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: #666;
  font-family: monospace;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 6px;
}

.rte-modal-input {
  width: 100%;
  box-sizing: border-box;
  padding: 9px 12px;
  border: 1.5px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: 'Georgia', serif;
  margin-bottom: 16px;
  outline: none;
  background: #fff;
}
.rte-modal-input:focus { border-color: #c8a96e; }

.rte-align-btns {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.rte-align-btn {
  flex: 1;
  padding: 7px;
  border: 2px solid #ddd;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  font-size: 12px;
  transition: border-color 0.1s, background 0.1s;
}
.rte-align-btn.active {
  border-color: #c8a96e;
  background: #fdf5e6;
  font-weight: 700;
}

.rte-modal-preview {
  display: block;
  max-width: 100%;
  max-height: 120px;
  border-radius: 4px;
  border: 1px solid #ddd;
  margin: 0 auto 20px;
  object-fit: cover;
}

.rte-modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.rte-modal-cancel {
  padding: 9px 20px;
  border: none;
  border-radius: 6px;
  background: #eee;
  color: #555;
  cursor: pointer;
  font-size: 14px;
}

.rte-modal-insert {
  padding: 9px 20px;
  border: none;
  border-radius: 6px;
  background: #c8a96e;
  color: #1a1a18;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  transition: opacity 0.1s;
}
.rte-modal-insert:disabled { opacity: 0.45; cursor: default; }
</style>