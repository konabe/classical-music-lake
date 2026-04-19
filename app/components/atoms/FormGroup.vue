<script setup lang="ts">
defineProps<{
  label: string;
  inputId?: string;
  required?: boolean;
  errorMessage?: string;
}>();
</script>

<template>
  <div class="form-group">
    <!-- eslint-disable-next-line vuejs-accessibility/label-has-for -->
    <label :for="inputId">
      {{ label }}
      <RequiredMark v-if="required" />
    </label>
    <slot />
    <ErrorMessage v-if="errorMessage" :message="errorMessage" />
  </div>
</template>

<style scoped>
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

label {
  font-weight: 500;
  color: var(--color-text-secondary);
}
</style>
