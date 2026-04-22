<script setup lang="ts">
import type { CreateComposerInput } from "~/types";

defineProps<{
  error: string | null;
}>();

const emit = defineEmits<{
  submit: [values: CreateComposerInput];
}>();
</script>

<template>
  <div>
    <h1 class="page-title">作曲家を追加</h1>

    <ErrorMessage v-if="error" :message="error" variant="block" />

    <ComposerForm submit-label="登録する" @submit="emit('submit', $event)" />
  </div>
</template>

<style scoped>
.page-title {
  font-size: 1.6rem;
  color: var(--color-text);
  margin-bottom: 1.5rem;
}
</style>
