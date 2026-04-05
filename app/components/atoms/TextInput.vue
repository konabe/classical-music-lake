<script setup lang="ts">
defineProps<{
  modelValue: string;
  id?: string;
  type?: "text" | "email" | "password";
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}>();

defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<template>
  <input
    :id="id"
    class="text-input"
    :type="type ?? 'text'"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :required="required"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>

<style scoped>
.text-input {
  border: 1px solid #9aa5b4;
  border-radius: 6px;
  padding: 0.6rem 0.8rem;
  font-size: 0.95rem;
  background: #faf3e0;
  transition: border-color 0.2s;
  width: 100%;
  box-sizing: border-box;
  font-family: inherit;
}

.text-input:focus {
  outline: none;
  border-color: #1e2d5a;
}
</style>
