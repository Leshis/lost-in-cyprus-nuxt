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

const isMenuOpen = ref(false);
const route = useRoute();
const hasGlobalError = ref(false)

const shouldHideNav = computed(() =>
  ['gate', 'login'].includes(route.name as string)
);

watch(() => route.fullPath, () => { isMenuOpen.value = false; });

const markErrored = (event: any) => {
  hasGlobalError.value = true;

  // Log the specific details to the console
  console.error("🔥 Global Error Caught!");
  
  if (event.type === 'unhandledrejection') {
    console.log("Reason:", event.reason); // Detailed promise rejection info
  } else if (event.error) {
    console.log("Error Object:", event.error); // The actual JS error stack
  } else {
    console.log("Event Data:", event);
  }
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

useSeoMeta({
  title: 'Lost in Cyprus - Explore the Island',
  description: 'Discover hidden gems must-see locations across Cyprus with our interactive map.',
  ogTitle: 'Lost in Cyprus',
  ogDescription: 'Discover hidden gems across Cyprus.',
  ogImage: '/lost-in-Cyprus.png',
  twitterCard: 'summary_large_image',
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