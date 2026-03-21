<script setup lang="ts">
import type { CreatePieceInput } from "~/types";

defineProps<{
  errorMessage: string;
}>();

const emit = defineEmits<{
  submit: [values: CreatePieceInput];
}>();
</script>

<template>
  <div>
    <h1 class="page-title">楽曲を追加</h1>

    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

    <PieceForm submit-label="登録する" @submit="emit('submit', $event)" />
  </div>
</template>

<style scoped>
.page-title {
  font-size: 1.6rem;
  color: #1a1a2e;
  margin-bottom: 1.5rem;
}

.error-message {
  background: #fff0f0;
  border: 1px solid #f5c6c6;
  color: #c0392b;
  padding: 0.8rem 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}
</style>
