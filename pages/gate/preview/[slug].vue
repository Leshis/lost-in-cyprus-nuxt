<template>
  <ArticleView :is-preview="true" />
</template>

<script lang="ts">
definePageMeta({
  middleware: 'gate',
})
</script>