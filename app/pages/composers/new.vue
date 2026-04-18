<script setup lang="ts">
import type { CreateComposerInput } from "~/types";

definePageMeta({ middleware: ["admin"] });

const { createComposer } = useComposersPaginated();
const errorMessage = ref("");

async function handleSubmit(values: CreateComposerInput) {
  errorMessage.value = "";
  try {
    await createComposer(values);
    await navigateTo("/composers");
  } catch {
    errorMessage.value = "登録に失敗しました。入力内容を確認してください。";
  }
}
</script>

<template>
  <ComposerNewTemplate :error-message="errorMessage" @submit="handleSubmit" />
</template>
