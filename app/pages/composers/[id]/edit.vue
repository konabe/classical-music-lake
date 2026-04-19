<script setup lang="ts">
import type { UpdateComposerInput } from "~/types";

definePageMeta({ middleware: ["admin"] });

const route = useRoute();
const id = computed(() => {
  return route.params.id as string;
});

const { data: composer, error } = await useComposer(() => {
  return id.value;
});
const { updateComposer } = useComposersPaginated();
const errorMessage = ref("");

async function handleSubmit(values: UpdateComposerInput) {
  errorMessage.value = "";
  try {
    await updateComposer(id.value, values);
    await navigateTo("/composers");
  } catch {
    errorMessage.value = "更新に失敗しました。入力内容を確認してください。";
  }
}
</script>

<template>
  <ComposerEditTemplate
    :composer="composer ?? null"
    :fetch-error="error"
    :error-message="errorMessage"
    @submit="handleSubmit"
  />
</template>
