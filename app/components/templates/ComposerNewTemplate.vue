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
    <PageTitle>作曲家を追加</PageTitle>

    <ErrorMessage v-if="error" :message="error" variant="block" />

    <ComposerForm submit-label="登録する" @submit="emit('submit', $event)" />
  </div>
</template>
