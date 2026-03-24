<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>

<template>
  <div class="auth-form-container">
    <h1>{{ title }}</h1>
    <slot />
  </div>
</template>

<style scoped>
.auth-form-container {
  background: #eaeef4;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(61, 36, 9, 0.15);
  width: 100%;
  max-width: 400px;
  border: 1px solid #9aa5b4;
}

h1 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #1e2d5a;
}
</style>
