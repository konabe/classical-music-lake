<script setup lang="ts">
defineProps<{
  isLoading: boolean;
  errors: { email: string; password: string; general: string };
}>();

const emit = defineEmits<{
  submit: [email: string, password: string];
}>();
</script>

<template>
  <div class="login-page">
    <LoginForm
      :is-loading="isLoading"
      :errors="errors"
      @submit="(email, password) => emit('submit', email, password)"
    />
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f4ed;
}
</style>
