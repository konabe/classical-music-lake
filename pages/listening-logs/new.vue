<script setup lang="ts">
import type { CreateListeningLogInput } from '~/types'

async function handleSubmit(values: CreateListeningLogInput) {
  await $fetch('/api/listening-logs', { method: 'POST', body: values })
  await navigateTo('/listening-logs')
}
</script>

<template>
  <div>
    <h1 class="page-title">鑑賞記録を追加</h1>
    <ListeningLogForm submit-label="記録する" @submit="handleSubmit" />
  </div>
</template>

<style scoped>
.page-title {
  font-size: 1.6rem;
  color: #1a1a2e;
  margin-bottom: 1.5rem;
}
</style>
