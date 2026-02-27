<script setup lang="ts">
import type { CreateConcertInput } from '~/types'

const apiBase = useApiBase()

async function handleSubmit(values: CreateConcertInput) {
  await $fetch(`${apiBase}/concerts`, { method: 'POST', body: values })
  await navigateTo('/concerts')
}
</script>

<template>
  <div>
    <h1 class="page-title">コンサート記録を追加</h1>
    <ConcertForm submit-label="記録する" @submit="handleSubmit" />
  </div>
</template>

<style scoped>
.page-title {
  font-size: 1.6rem;
  color: #1a1a2e;
  margin-bottom: 1.5rem;
}
</style>
