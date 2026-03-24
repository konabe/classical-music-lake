<script setup lang="ts">
import type { CreatePieceInput } from "~/types";

const props = defineProps<{
  initialValues?: Partial<CreatePieceInput>;
  submitLabel?: string;
}>();

const emit = defineEmits<{
  submit: [values: CreatePieceInput];
}>();

const form = reactive<CreatePieceInput>({
  title: "",
  composer: "",
});

watch(
  () => props.initialValues,
  (initialValues) => {
    form.title = initialValues?.title ?? "";
    form.composer = initialValues?.composer ?? "";
  },
  { immediate: true }
);

function handleSubmit() {
  emit("submit", { ...form });
}
</script>

<template>
  <form class="piece-form" @submit.prevent="handleSubmit">
    <div class="form-group">
      <label for="title">曲名 <RequiredMark /></label>
      <TextInput id="title" v-model="form.title" required placeholder="例：交響曲第9番" />
    </div>

    <div class="form-group">
      <label for="composer">作曲家 <RequiredMark /></label>
      <TextInput id="composer" v-model="form.composer" required placeholder="例：ベートーヴェン" />
    </div>

    <div class="form-actions">
      <ButtonSecondary label="キャンセル" @click="$router.push('/pieces')" />
      <ButtonPrimary type="submit">{{ submitLabel ?? "保存する" }}</ButtonPrimary>
    </div>
  </form>
</template>

<style scoped>
.piece-form {
  max-width: 480px;
}

.form-group {
  margin-bottom: 1.2rem;
}

.form-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 0.4rem;
  color: #333;
  font-size: 0.9rem;
}

.form-actions {
  display: flex;
  gap: 0.8rem;
  margin-top: 1.5rem;
}
</style>
