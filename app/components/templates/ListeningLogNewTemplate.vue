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
    <p v-if="error" class="error-message">{{ error }}</p>
    <ListeningLogForm submit-label="記録する" @submit="emit('submit', $event)" />
  </div>
</template>

<style scoped>
.page-title {
  font-size: 1.6rem;
  color: #1a1a2e;
  margin-bottom: 1.5rem;
}

.error-message {
  color: #e05a5a;
  margin-bottom: 1rem;
}
</style>
