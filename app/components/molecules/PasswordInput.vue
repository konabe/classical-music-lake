<script setup lang="ts">
defineProps<{
  modelValue: string;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}>();

defineEmits<{
  "update:modelValue": [value: string];
}>();

const isVisible = ref(false);

function toggleVisibility() {
  isVisible.value = !isVisible.value;
}
</script>

<template>
  <div class="password-input">
    <TextInput
      :id="id"
      :model-value="modelValue"
      :type="isVisible ? 'text' : 'password'"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      @update:model-value="$emit('update:modelValue', $event)"
    />
    <button
      type="button"
      class="toggle-button"
      :aria-label="isVisible ? 'パスワードを非表示' : 'パスワードを表示'"
      :aria-pressed="isVisible"
      @click="toggleVisibility"
    >
      <svg
        v-if="isVisible"
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.password-input {
  position: relative;
  width: 100%;
}

.toggle-button {
  position: absolute;
  top: 50%;
  right: 0.5rem;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: 4px;
}

.toggle-button:hover {
  color: var(--color-text);
}

.toggle-button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
</style>

<style>
.password-input .text-input {
  padding-right: 2.5rem;
}
</style>
