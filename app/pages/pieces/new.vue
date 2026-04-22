<script setup lang="ts">
import type { CreatePieceInput } from "~/types";

definePageMeta({ middleware: ["admin"] });

const { createPiece } = usePiecesPaginated();
const { data: composers, pending: composersPending, refresh: refreshComposers } = useComposersAll();
await refreshComposers();

const { error, handleSubmit } = useSubmitHandler<CreatePieceInput>({
  submit: (values) => createPiece(values),
  redirectTo: "/pieces",
  errorMessage: "登録に失敗しました。入力内容を確認してください。",
});
</script>

<template>
  <PieceNewTemplate
    :error="error"
    :composers="composers ?? []"
    :composers-pending="composersPending"
    @submit="handleSubmit"
  />
</template>
