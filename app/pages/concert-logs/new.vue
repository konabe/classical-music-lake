<script setup lang="ts">
import type { CreateConcertLogInput } from "~/types";

definePageMeta({ middleware: "auth" });

const { create } = useConcertLogs();
const error = ref<string | null>(null);

async function handleSubmit(values: CreateConcertLogInput) {
  error.value = null;
  try {
    await create(values);
    await navigateTo("/concert-logs");
  } catch {
    error.value = "記録の作成に失敗しました。";
  }
}
</script>

<template>
  <ConcertLogNewTemplate :error="error" @submit="handleSubmit" />
</template>
