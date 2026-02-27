<script setup lang="ts">
import type { ListeningLog, UpdateListeningLogInput } from '~/types'

const route = useRoute()
const apiBase = useApiBase()
const { data: log } = await useFetch<ListeningLog>(`${apiBase}/listening-logs/${route.params.id}`)

async function handleSubmit(values: UpdateListeningLogInput) {
  await $fetch(`${apiBase}/listening-logs/${route.params.id}`, { method: 'PUT', body: values })
  await navigateTo(`/listening-logs/${route.params.id}`)
}
</script>

<template>
  <div v-if="log">
    <h1 class="page-title">鑑賞記録を編集</h1>
    <ListeningLogForm
      :initial-values="log"
      submit-label="更新する"
      @submit="handleSubmit"
    />
  </div>
</template>

<style scoped>
.page-title {
  font-size: 1.6rem;
  color: #1a1a2e;
  margin-bottom: 1.5rem;
}
</style>
