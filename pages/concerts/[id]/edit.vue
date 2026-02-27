<script setup lang="ts">
import type { Concert, UpdateConcertInput } from '~/types'

const route = useRoute()
const apiBase = useApiBase()
const { data: concert } = await useFetch<Concert>(`${apiBase}/concerts/${route.params.id}`)

async function handleSubmit(values: UpdateConcertInput) {
  await $fetch(`${apiBase}/concerts/${route.params.id}`, { method: 'PUT', body: values })
  await navigateTo(`/concerts/${route.params.id}`)
}
</script>

<template>
  <div v-if="concert">
    <h1 class="page-title">コンサート記録を編集</h1>
    <ConcertForm
      :initial-values="concert"
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
