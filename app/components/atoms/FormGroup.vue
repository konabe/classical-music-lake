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
    <label class="form-label" :for="inputId">
      <span class="form-label-text">{{ label }}</span>
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
  gap: 0.45rem;
}

.form-label {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-family: var(--font-sans);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.form-label-text {
  display: inline-block;
}
</style>
