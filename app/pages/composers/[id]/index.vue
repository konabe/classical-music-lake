<script setup lang="ts">
import type { Composer } from "~/types";

const route = useRoute();
const { data: composer, error } = await useComposer(() => route.params.id as string);
const { deleteComposer } = useComposersPaginated();
const { isAdmin } = useAuth();
const isAdminUser = isAdmin();

async function handleDelete(target: Composer) {
  if (!confirm(`「${target.name}」を削除しますか？`)) {
    return;
  }
  try {
    await deleteComposer(target.id);
    await navigateTo("/composers");
  } catch {
    alert("削除に失敗しました。もう一度お試しください。");
  }
}
</script>

<template>
  <ComposerDetailTemplate
    :composer="composer ?? null"
    :error="error"
    :is-admin="isAdminUser"
    @delete="handleDelete"
  />
</template>
