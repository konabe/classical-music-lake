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
    <FormGroup label="曲名" input-id="title" required>
      <TextInput id="title" v-model="form.title" required placeholder="例：交響曲第9番" />
    </FormGroup>

    <FormGroup label="作曲家" input-id="composer" required>
      <TextInput id="composer" v-model="form.composer" required placeholder="例：ベートーヴェン" />
    </FormGroup>

    <div class="form-actions">
      <ButtonSecondary label="キャンセル" @click="$router.push('/pieces')" />
      <ButtonPrimary type="submit">{{ submitLabel ?? "保存する" }}</ButtonPrimary>
    </div>
  </form>
</template>

<style scoped>
.piece-form {
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.form-actions {
  display: flex;
  gap: 0.8rem;
  margin-top: 1.5rem;
}
</style>
