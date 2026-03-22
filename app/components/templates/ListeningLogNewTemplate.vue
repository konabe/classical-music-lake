<script setup lang="ts">
import type { CreateListeningLogInput } from "~/types";

defineProps<{
  error: string | null;
}>();

const emit = defineEmits<{
  submit: [values: CreateListeningLogInput];
}>();
</script>

<template>
  <div>
    <h1 class="page-title">鑑賞記録を追加</h1>
    <ErrorMessage v-if="error" :message="error" />
    <ListeningLogForm submit-label="記録する" @submit="emit('submit', $event)" />
  </div>
</template>

<style scoped>
.page-title {
  font-size: 1.6rem;
  color: #1e2d5a;
  margin-bottom: 1.5rem;
}
</style>
