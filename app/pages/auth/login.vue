<script setup lang="ts">
const { login } = useAuth();
const router = useRouter();

const errors = reactive({
  email: "",
  password: "",
  general: "",
});

const isLoading = ref(false);

async function handleSubmit(email: string, password: string) {
  errors.email = "";
  errors.password = "";
  errors.general = "";
  isLoading.value = true;

  try {
    const result = await login(email, password);

    if (result.success) {
      await router.push("/");
    } else {
      if (result.errorType === "email") {
        errors.email = "有効なメールアドレスを入力してください";
      } else if (result.errorType === "password") {
        errors.password = "パスワードを入力してください";
      } else if (result.errorType === "not_confirmed") {
        errors.general = "メールアドレスの確認が完了していません。確認メールをご確認ください。";
      } else {
        errors.general = "メールアドレスまたはパスワードが正しくありません。";
      }
    }
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <LoginTemplate :is-loading="isLoading" :errors="errors" @submit="handleSubmit" />
</template>
