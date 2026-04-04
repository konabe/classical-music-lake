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
    <template v-if="inputId">
      <label :for="inputId">
        {{ label }}
        <RequiredMark v-if="required" />
      </label>
      <slot />
    </template>
    <!-- eslint-disable-next-line vuejs-accessibility/label-has-for -->
    <label v-else class="form-label-wrap">
      <span class="form-label-text">{{ label }}<RequiredMark v-if="required" /></span>
      <slot />
    </label>
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
  color: #333;
}

.form-label-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-label-text {
  font-weight: 500;
  color: #333;
}
</style>
