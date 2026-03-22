<script setup lang="ts">
defineProps<{
  isLoading: boolean;
  errors: { email: string; password: string };
  successMessage: string;
}>();

const emit = defineEmits<{
  submit: [email: string, password: string];
}>();
</script>

<template>
  <div class="register-page">
    <UserRegisterForm
      :is-loading="isLoading"
      :errors="errors"
      :success-message="successMessage"
      @submit="(email, password) => emit('submit', email, password)"
    />
  </div>
</template>

<style scoped>
.register-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f4ed;
}
</style>
