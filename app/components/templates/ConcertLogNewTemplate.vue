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
    <PageTitle>コンサート記録を追加</PageTitle>
    <ErrorMessage v-if="error" :message="error" />
    <ConcertLogForm submit-label="記録する" @submit="emit('submit', $event)" />
  </div>
</template>
