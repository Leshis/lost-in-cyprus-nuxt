<template>
  <div id="app-container">
    <div v-if="hasGlobalError" class="global-error">
      Something went wrong, please refresh.
    </div>
    <TheNavbar v-if="!shouldHideNav" @openMenu="isMenuOpen = true" />
    <TheMenu :isOpen="isMenuOpen" @close="isMenuOpen = false" />

    <main class="main-content">
      <NuxtPage v-if="!hasGlobalError" />  <!-- ← was <router-view /> -->
    </main>

    <TheFooter v-if="!shouldHideNav" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import TheNavbar from '@/components/TheNavbar.vue';
import TheMenu from '@/components/TheMenu.vue';
import TheFooter from '@/components/TheFooter.vue';

const isMenuOpen = ref(false);
const route = useRoute();
const hasGlobalError = ref(false)

const shouldHideNav = computed(() =>
  ['Admin', 'Login', 'ArticlePreview'].includes(route.name as string)
);

watch(() => route.fullPath, () => { isMenuOpen.value = false; });

const markErrored = () => {
  hasGlobalError.value = true
}

onMounted(() => {
  window.addEventListener('app-global-error', markErrored)
  window.addEventListener('error', markErrored)
  window.addEventListener('unhandledrejection', markErrored)
})

onUnmounted(() => {
  window.removeEventListener('app-global-error', markErrored)
  window.removeEventListener('error', markErrored)
  window.removeEventListener('unhandledrejection', markErrored)
})

</script>

<style scoped>
#app-container {
  display: flex;              /* ← fixes the footer bounce */
  flex-direction: column;
  min-height: 100svh;
  background-color: #f8f6f0;
}

.main-content {
  flex: 1;                   /* ← pushes footer to the bottom always */
}

.global-error {
  margin: 1rem;
  padding: 0.875rem 1rem;
  border-radius: 8px;
  background: #fdecea;
  color: #b42318;
  border: 1px solid #f7c5c0;
}
</style>