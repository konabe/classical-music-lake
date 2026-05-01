<script setup lang="ts">
defineProps<{
  isSubmitting?: boolean;
  submitLabel?: string;
}>();

const emit = defineEmits<{
  cancel: [];
}>();
</script>

<template>
  <div class="form-actions">
    <ButtonSecondary @click="emit('cancel')">キャンセル</ButtonSecondary>
    <ButtonPrimary type="submit" :disabled="isSubmitting">
      {{ submitLabel ?? "保存する" }}
    </ButtonPrimary>
  </div>
</template>

<style scoped>
.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
}
</style>
