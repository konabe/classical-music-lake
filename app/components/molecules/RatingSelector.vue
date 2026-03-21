<script setup lang="ts">
import type { Rating } from "~/types";

defineProps<{
  modelValue: Rating;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: Rating];
}>();
</script>

<template>
  <div class="rating-selector">
    <button
      v-for="n in 5"
      :key="n"
      type="button"
      class="star-btn"
      :class="{ active: n <= modelValue }"
      :aria-label="`${n}星`"
      :aria-pressed="n <= modelValue"
      @click="emit('update:modelValue', n as Rating)"
    >
      ★
    </button>
  </div>
</template>

<style scoped>
.rating-selector {
  display: flex;
  gap: 0.3rem;
}

.star-btn {
  background: none;
  border: none;
  font-size: 1.6rem;
  cursor: pointer;
  color: #c2a878;
  transition: color 0.15s;
}

.star-btn.active {
  color: #c9a227;
}
</style>
