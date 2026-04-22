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
    <PageTitle>鑑賞記録を追加</PageTitle>
    <ErrorMessage v-if="error" :message="error" />
    <ListeningLogForm submit-label="記録する" @submit="emit('submit', $event)" />
  </div>
</template>
