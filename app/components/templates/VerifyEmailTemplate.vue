<script setup lang="ts">
defineProps<{
  email: string;
  isLoading: boolean;
  error: string;
  infoMessage: string;
}>();

const emit = defineEmits<{
  submit: [code: string];
  resend: [];
}>();
</script>

<template>
  <div class="verify-email-page">
    <VerifyEmailForm
      :email="email"
      :is-loading="isLoading"
      :error="error"
      :info-message="infoMessage"
      @submit="(code) => emit('submit', code)"
      @resend="emit('resend')"
    />
  </div>
</template>

<style scoped>
.verify-email-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--color-bg-base);
}
</style>
