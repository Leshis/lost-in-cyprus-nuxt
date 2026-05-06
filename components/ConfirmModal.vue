<template>
  <Transition name="fade">
    <div v-if="isOpen" class="modal-overlay" @click.self="$emit('cancel')">
      <div class="modal-card">
        <div class="modal-header">
          <h3>Are you sure?</h3>
          <p>You are about to delete <strong>"{{ title }}"</strong>. This action cannot be undone.</p>
        </div>
        
        <div class="modal-footer">
          <button @click="$emit('cancel')" class="btn-ghost">
            No, Keep it
          </button>
          <button @click="$emit('confirm')" class="btn-danger" :disabled="isLoading">
            Yes, Delete it
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  isOpen: boolean
  title: string
  isLoading: boolean
}>()

defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-card {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  text-align: center;
}

.modal-header h3 {
  margin-top: 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.modal-header p {
  color: #64748b;
  line-height: 1.5;
  margin: 1rem 0 2rem;
}

.modal-footer {
  display: flex;
  gap: 1rem;
}

/* Animation */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>