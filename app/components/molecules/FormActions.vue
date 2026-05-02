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
    <span class="form-actions-rule" aria-hidden="true" />
    <div class="form-actions-buttons">
      <ButtonSecondary @click="emit('cancel')">Cancel</ButtonSecondary>
      <ButtonPrimary type="submit" :disabled="isSubmitting">
        {{ submitLabel ?? "保存する" }}
      </ButtonPrimary>
    </div>
  </div>
</template>

<style scoped>
.form-actions {
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
  margin-top: 1.5rem;
}

.form-actions-rule {
  height: 1px;
  background: var(--color-hairline);
}

.form-actions-buttons {
  display: flex;
  gap: 0.8rem;
  justify-content: flex-end;
  flex-wrap: wrap;
}
</style>
