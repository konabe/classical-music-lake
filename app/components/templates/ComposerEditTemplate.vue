<script setup lang="ts">
import type { Composer, UpdateComposerInput } from "~/types";

defineProps<{
  composer: Composer | null;
  fetchError: Error | null;
  error: string | null;
}>();

const emit = defineEmits<{
  submit: [values: UpdateComposerInput];
}>();
</script>

<template>
  <div>
    <h1 class="page-title">作曲家を編集</h1>

    <ErrorMessage v-if="fetchError" message="作曲家の取得に失敗しました。" variant="block" />

    <template v-else>
      <ErrorMessage v-if="error" :message="error" variant="block" />
      <ComposerForm
        :initial-values="{
          name: composer?.name,
          era: composer?.era,
          region: composer?.region,
          imageUrl: composer?.imageUrl,
        }"
        submit-label="更新する"
        @submit="emit('submit', $event)"
      />
    </template>
  </div>
</template>

<style scoped>
.page-title {
  font-size: 1.6rem;
  color: var(--color-text);
  margin-bottom: 1.5rem;
}
</style>
