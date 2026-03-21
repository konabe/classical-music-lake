<script setup lang="ts">
import type { CreateListeningLogInput } from "~/types";

definePageMeta({ middleware: "auth" });

const { create } = useListeningLogs();
const error = ref<string | null>(null);

async function handleSubmit(values: CreateListeningLogInput) {
  error.value = null;
  try {
    await create(values);
    await navigateTo("/listening-logs");
  } catch {
    error.value = "記録の作成に失敗しました。";
  }
}
</script>

<template>
  <div>
    <h1 class="page-title">鑑賞記録を追加</h1>
    <p v-if="error" class="error-message">{{ error }}</p>
    <ListeningLogForm submit-label="記録する" @submit="handleSubmit" />
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
