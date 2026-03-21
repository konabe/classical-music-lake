<script setup lang="ts">
const { validateEmail, register } = useAuth();

const errors = reactive({
  email: "",
  password: "",
});

const isLoading = ref(false);
const successMessage = ref("");

async function handleSubmit(email: string, password: string) {
  errors.email = "";
  errors.password = "";
  successMessage.value = "";

  if (!validateEmail(email)) {
    errors.email = "有効なメールアドレスを入力してください";
    return;
  }

  isLoading.value = true;

  try {
    const result = await register(email, password);

    if (result.success) {
      successMessage.value = "確認メールを送信しました。メールをご確認ください。";
    } else {
      if (result.error?.includes("email")) {
        errors.email = result.error;
      } else if (result.error?.includes("password")) {
        errors.password = result.error;
      } else if (result.error?.includes("already")) {
        errors.email = "このメールアドレスは既に登録されています";
      } else {
        errors.email = result.error || "登録に失敗しました";
      }
    }
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <UserRegisterTemplate
    :is-loading="isLoading"
    :errors="errors"
    :success-message="successMessage"
    @submit="handleSubmit"
  />
</template>
