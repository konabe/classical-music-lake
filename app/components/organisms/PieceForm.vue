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
      <input id="title" v-model="form.title" type="text" required placeholder="例：交響曲第9番" />
    </div>

    <div class="form-group">
      <label for="composer">作曲家 <RequiredMark /></label>
      <input
        id="composer"
        v-model="form.composer"
        type="text"
        required
        placeholder="例：ベートーヴェン"
      />
    </div>

    <div class="form-actions">
      <NuxtLink to="/pieces" class="btn-secondary">キャンセル</NuxtLink>
      <button type="submit" class="btn-primary">{{ submitLabel ?? "保存する" }}</button>
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

.form-group input {
  width: 100%;
  padding: 0.6rem 0.8rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #1e2d5a;
}

.form-actions {
  display: flex;
  gap: 0.8rem;
  margin-top: 1.5rem;
}
</style>
