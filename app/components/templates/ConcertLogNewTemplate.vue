<script setup lang="ts">
import type { CreateConcertLogInput } from "~/types";

defineProps<{
  error: string | null;
}>();

const emit = defineEmits<{
  submit: [values: CreateConcertLogInput];
}>();
</script>

<template>
  <div>
    <h1 class="page-title">コンサート記録を追加</h1>
    <ErrorMessage v-if="error" :message="error" />
    <ConcertLogForm submit-label="記録する" @submit="emit('submit', $event)" />
  </div>
</template>

<style scoped>
.page-title {
  font-size: 1.6rem;
  color: var(--color-text);
  margin-bottom: 1.5rem;
}
</style>
