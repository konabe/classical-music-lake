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

    <FormActions :submit-label="submitLabel" @cancel="$router.push('/pieces')" />
  </form>
</template>

<style scoped>
.piece-form {
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
</style>
